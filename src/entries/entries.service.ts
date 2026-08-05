import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MaterialType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntryDTO } from './dto/create-entry.dto';
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

  async findAll(materialId?: string): Promise<EntryOutputDTO[]> {
    const entries = await this.prisma.stockEntry.findMany({
      where: materialId ? { materialId } : undefined,
    });

    return entries.map((entry) => new EntryOutputDTO(entry));
  }
}
