import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Material, MaterialType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDTO } from './dto/create-material.dto';
import { UpdateMaterialDTO } from './dto/update-material.dto';
import { MaterialOutputDTO } from './dto/material-output.dto';
import { normalizeName } from '../utils/normalize-name.util';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialDTO): Promise<MaterialOutputDTO> {
    const name = normalizeName(dto.name);

    const existing = await this.prisma.material.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existing) {
      throw new ConflictException(`Já existe um material com o nome "${name}"`);
    }

    try {
      const material = await this.prisma.material.create({
        data: {
          name,
          type: MaterialType.SIMPLE,
        },
      });

      return this.toOutputDto(material);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Já existe um material com o nome "${name}"`,
        );
      }

      throw error;
    }
  }

  async findAll(type?: MaterialType): Promise<MaterialOutputDTO[]> {
    const materials = await this.prisma.material.findMany({
      where: type ? { type } : undefined,
    });

    return materials.map((material) => this.toOutputDto(material));
  }

  async findOne(id: string): Promise<MaterialOutputDTO> {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException(`Material com id ${id} não encontrado`);
    }

    return this.toOutputDto(material);
  }

  async update(id: string, dto: UpdateMaterialDTO): Promise<MaterialOutputDTO> {
    await this.findOne(id);

    const name = dto.name !== undefined ? normalizeName(dto.name) : undefined;

    if (name !== undefined) {
      const existing = await this.prisma.material.findFirst({
        where: { name: { equals: name, mode: 'insensitive' }, NOT: { id } },
      });

      if (existing) {
        throw new ConflictException(
          `Já existe um material com o nome "${name}"`,
        );
      }
    }

    const material = await this.prisma.material.update({
      where: { id },
      data: {
        name,
        referenceQuantity: dto.referenceQuantity,
      },
    });

    return this.toOutputDto(material);
  }

  private toOutputDto(material: Material): MaterialOutputDTO {
    const percentage = material.referenceQuantity
      ? (material.currentQuantity / material.referenceQuantity) * 100
      : null;

    const lowStockAlert =
      material.type === MaterialType.SIMPLE &&
      percentage !== null &&
      percentage <= 50;

    return new MaterialOutputDTO(material, percentage, lowStockAlert);
  }
}
