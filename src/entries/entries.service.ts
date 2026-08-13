import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MaterialType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntryDTO } from './dto/create-entry.dto';
import { UpdateEntryDTO } from './dto/update-entry.dto';
import { EntryOutputDTO } from './dto/entry-output.dto';

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEntryDTO): Promise<EntryOutputDTO> {
    const entry = await this.prisma.$transaction(async (tx) => {
      const material = await tx.material.findUnique({
        where: { id: dto.materialId },
      });

      if (!material) {
        throw new NotFoundException(
          `Material com id ${dto.materialId} não encontrado`,
        );
      }

      if (material.type !== MaterialType.SIMPLE) {
        throw new BadRequestException(
          'Entradas só podem ser registradas para materiais do tipo SIMPLE',
        );
      }

      const createdEntry = await tx.stockEntry.create({
        data: {
          materialId: dto.materialId,
          quantity: dto.quantity,
          createdAt: dto.createdAt
            ? new Date(`${dto.createdAt}T12:00:00`)
            : undefined,
        },
      });

      await tx.material.update({
        where: { id: dto.materialId },
        data: {
          currentQuantity: { increment: dto.quantity },
          referenceQuantity:
            material.referenceQuantity === null ? dto.quantity : undefined,
        },
      });

      return createdEntry;
    });

    return new EntryOutputDTO(entry);
  }

  async update(id: string, dto: UpdateEntryDTO): Promise<EntryOutputDTO> {
    const { entry, warning } = await this.prisma.$transaction(async (tx) => {
      const existingEntry = await tx.stockEntry.findUnique({ where: { id } });

      if (!existingEntry) {
        throw new NotFoundException(`Entrada com id ${id} não encontrada`);
      }

      const firstEntry = await tx.stockEntry.findFirst({
        where: { materialId: existingEntry.materialId },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      });

      const isFirstEntry = firstEntry?.id === existingEntry.id;
      const delta = dto.quantity - existingEntry.quantity;

      const updatedEntry = await tx.stockEntry.update({
        where: { id },
        data: { quantity: dto.quantity },
      });

      const updatedMaterial = await tx.material.update({
        where: { id: existingEntry.materialId },
        data: {
          currentQuantity: { increment: delta },
          referenceQuantity: isFirstEntry ? dto.quantity : undefined,
        },
      });

      const resultingWarning =
        updatedMaterial.currentQuantity < 0
          ? `Estoque insuficiente: saldo ficará em ${updatedMaterial.currentQuantity} após a edição.`
          : undefined;

      return { entry: updatedEntry, warning: resultingWarning };
    });

    return new EntryOutputDTO(entry, warning);
  }

  async findAll(materialId?: string): Promise<EntryOutputDTO[]> {
    const entries = await this.prisma.stockEntry.findMany({
      where: materialId ? { materialId } : undefined,
    });

    return entries.map((entry) => new EntryOutputDTO(entry));
  }
}
