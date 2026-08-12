import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Occasion, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOccasionDTO } from './dto/create-occasion.dto';
import { OccasionOutputDTO } from './dto/occasion-output.dto';
import { OccasionStatsQueryDTO } from './dto/occasion-stats-query.dto';
import {
  OccasionStatsMaterialDTO,
  OccasionStatsOutputDTO,
  OccasionStatsPersonDTO,
} from './dto/occasion-stats-output.dto';
import { normalizeName } from '../utils/normalize-name.util';

@Injectable()
export class OccasionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOccasionDTO): Promise<OccasionOutputDTO> {
    const name = normalizeName(dto.name);

    const existing = await this.prisma.occasion.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existing) {
      throw new ConflictException(`Já existe uma ocasião com o nome "${name}"`);
    }

    try {
      const occasion = await this.prisma.occasion.create({
        data: { name },
      });

      return this.toOutputDto(occasion);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Já existe uma ocasião com o nome "${name}"`,
        );
      }

      throw error;
    }
  }

  async findAll(): Promise<OccasionOutputDTO[]> {
    const occasions = await this.prisma.occasion.findMany();

    return occasions.map((occasion) => this.toOutputDto(occasion));
  }

  async getStats(
    id: string,
    query: OccasionStatsQueryDTO,
  ): Promise<OccasionStatsOutputDTO> {
    const occasion = await this.prisma.occasion.findUnique({ where: { id } });

    if (!occasion) {
      throw new NotFoundException(`Ocasião com id ${id} não encontrada`);
    }

    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    const createdAt = from || to ? { gte: from, lte: to } : undefined;

    const [withdrawals, returns] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where: { occasionId: id, createdAt },
        select: {
          quantity: true,
          materialId: true,
          material: { select: { name: true } },
          personId: true,
          person: { select: { name: true } },
        },
      }),
      this.prisma.return.findMany({
        where: { occasionId: id, createdAt },
        select: {
          quantity: true,
          materialId: true,
          material: { select: { name: true } },
        },
      }),
    ]);

    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.quantity, 0);
    const totalReturned = returns.reduce((sum, r) => sum + r.quantity, 0);

    const materialsMap = new Map<
      string,
      { name: string; withdrawn: number; returned: number }
    >();

    for (const withdrawal of withdrawals) {
      const entry = materialsMap.get(withdrawal.materialId) ?? {
        name: withdrawal.material.name,
        withdrawn: 0,
        returned: 0,
      };
      entry.withdrawn += withdrawal.quantity;
      materialsMap.set(withdrawal.materialId, entry);
    }

    for (const stockReturn of returns) {
      const entry = materialsMap.get(stockReturn.materialId) ?? {
        name: stockReturn.material.name,
        withdrawn: 0,
        returned: 0,
      };
      entry.returned += stockReturn.quantity;
      materialsMap.set(stockReturn.materialId, entry);
    }

    const materials = Array.from(materialsMap.entries())
      .map(
        ([materialId, value]) =>
          new OccasionStatsMaterialDTO(
            materialId,
            value.name,
            value.withdrawn,
            value.returned,
          ),
      )
      .sort((a, b) => b.withdrawn - a.withdrawn);

    const peopleMap = new Map<
      string,
      { name: string; totalWithdrawn: number }
    >();

    for (const withdrawal of withdrawals) {
      const entry = peopleMap.get(withdrawal.personId) ?? {
        name: withdrawal.person.name,
        totalWithdrawn: 0,
      };
      entry.totalWithdrawn += withdrawal.quantity;
      peopleMap.set(withdrawal.personId, entry);
    }

    const people = Array.from(peopleMap.entries())
      .map(
        ([personId, value]) =>
          new OccasionStatsPersonDTO(
            personId,
            value.name,
            value.totalWithdrawn,
          ),
      )
      .sort((a, b) => b.totalWithdrawn - a.totalWithdrawn);

    return new OccasionStatsOutputDTO({
      occasionId: occasion.id,
      name: occasion.name,
      from: query.from ?? null,
      to: query.to ?? null,
      totalWithdrawn,
      totalReturned,
      materials,
      people,
    });
  }

  private toOutputDto(occasion: Occasion): OccasionOutputDTO {
    return new OccasionOutputDTO(occasion);
  }
}
