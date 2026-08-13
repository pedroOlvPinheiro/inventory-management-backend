import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Material, MaterialType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeName } from '../utils/normalize-name.util';
import { sortTags } from '../utils/sort-tags.util';
import { CreateKitDTO } from './dto/create-kit.dto';
import { AssembleKitDTO } from './dto/assemble-kit.dto';
import { KitComponentOutputDTO, KitOutputDTO } from './dto/kit-output.dto';

@Injectable()
export class KitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateKitDTO): Promise<KitOutputDTO> {
    const name = normalizeName(dto.name);
    const tags = sortTags(dto.tags);

    const materialIds = dto.components.map((component) => component.materialId);
    const uniqueMaterialIds = new Set(materialIds);

    if (uniqueMaterialIds.size !== materialIds.length) {
      throw new BadRequestException(
        'components não pode ter materialId repetido',
      );
    }

    const existing = await this.prisma.material.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        tags: { equals: tags },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe um kit com o nome "${name}" e a(s) mesma(s) etiqueta(s)`,
      );
    }

    const componentMaterials = await this.prisma.material.findMany({
      where: { id: { in: materialIds } },
    });

    for (const materialId of materialIds) {
      const componentMaterial = componentMaterials.find(
        (material) => material.id === materialId,
      );

      if (!componentMaterial) {
        throw new NotFoundException(
          `Material com id ${materialId} não encontrado`,
        );
      }

      if (componentMaterial.type !== MaterialType.SIMPLE) {
        throw new BadRequestException(
          `Material "${componentMaterial.name}" não pode compor um kit: apenas materiais do tipo SIMPLE podem ser componentes`,
        );
      }
    }

    const kit = await this.prisma.$transaction(async (tx) => {
      const createdKit = await tx.material.create({
        data: { name, type: MaterialType.KIT, tags },
      });

      await tx.kitComponent.createMany({
        data: dto.components.map((component) => ({
          kitId: createdKit.id,
          componentId: component.materialId,
          quantityPerKit: component.quantityPerKit,
        })),
      });

      return createdKit;
    });

    return this.toOutputDto(kit);
  }

  async findAll(): Promise<KitOutputDTO[]> {
    const kits = await this.prisma.material.findMany({
      where: { type: MaterialType.KIT },
    });

    return Promise.all(kits.map((kit) => this.toOutputDto(kit)));
  }

  async findOne(id: string): Promise<KitOutputDTO> {
    const kit = await this.findKitOrThrow(id);

    return this.toOutputDto(kit);
  }

  async assemble(id: string, dto: AssembleKitDTO): Promise<KitOutputDTO> {
    const existingKit = await this.findKitOrThrow(id);

    const { kit, warning } = await this.prisma.$transaction(async (tx) => {
      const recipe = await tx.kitComponent.findMany({
        where: { kitId: id },
        include: { component: true },
      });

      const insufficientComponents: string[] = [];

      for (const kitComponent of recipe) {
        const updatedComponent = await tx.material.update({
          where: { id: kitComponent.componentId },
          data: {
            currentQuantity: {
              decrement: dto.quantity * kitComponent.quantityPerKit,
            },
          },
        });

        if (updatedComponent.currentQuantity < 0) {
          insufficientComponents.push(
            `${updatedComponent.name} (saldo ficará em ${updatedComponent.currentQuantity})`,
          );
        }
      }

      const updatedKit = await tx.material.update({
        where: { id },
        data: {
          currentQuantity: { increment: dto.quantity },
          referenceQuantity:
            existingKit.referenceQuantity === null ? dto.quantity : undefined,
        },
      });

      await tx.kitAssembly.create({
        data: { kitId: id, quantityAssembled: dto.quantity },
      });

      const resultingWarning =
        insufficientComponents.length > 0
          ? `Estoque insuficiente para: ${insufficientComponents.join(', ')}.`
          : undefined;

      return { kit: updatedKit, warning: resultingWarning };
    });

    return this.toOutputDto(kit, warning);
  }

  private async findKitOrThrow(id: string): Promise<Material> {
    const kit = await this.prisma.material.findUnique({ where: { id } });

    if (!kit || kit.type !== MaterialType.KIT) {
      throw new NotFoundException(`Kit com id ${id} não encontrado`);
    }

    return kit;
  }

  private async toOutputDto(
    material: Material,
    warning?: string,
  ): Promise<KitOutputDTO> {
    const percentage = material.referenceQuantity
      ? (material.currentQuantity / material.referenceQuantity) * 100
      : null;

    const lowStockAlert =
      material.type === MaterialType.SIMPLE &&
      percentage !== null &&
      percentage <= 50;

    const kitComponents = await this.prisma.kitComponent.findMany({
      where: { kitId: material.id },
      include: { component: true },
    });

    const components = kitComponents.map(
      (kitComponent) =>
        new KitComponentOutputDTO(
          kitComponent.componentId,
          kitComponent.component.name,
          kitComponent.quantityPerKit,
        ),
    );

    return new KitOutputDTO(
      material,
      percentage,
      lowStockAlert,
      components,
      warning,
    );
  }
}
