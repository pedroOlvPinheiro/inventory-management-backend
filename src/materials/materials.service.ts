import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Material, MaterialType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDTO } from './dto/create-material.dto';
import { UpdateMaterialDTO } from './dto/update-material.dto';
import { MaterialOutputDTO } from './dto/material-output.dto';
import { MaterialStatsQueryDTO } from './dto/material-stats-query.dto';
import {
  MaterialStatsOutputDTO,
  MaterialStatsTimelinePointDTO,
} from './dto/material-stats-output.dto';
import { normalizeName } from '../utils/normalize-name.util';
import { sortTags } from '../utils/sort-tags.util';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialDTO): Promise<MaterialOutputDTO> {
    const name = normalizeName(dto.name);
    const tags = sortTags(dto.tags);

    const existing = await this.prisma.material.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        tags: { equals: tags },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe um material com o nome "${name}" e a(s) mesma(s) etiqueta(s)`,
      );
    }

    const material = await this.prisma.material.create({
      data: {
        name,
        type: MaterialType.SIMPLE,
        tags,
      },
    });

    return this.toOutputDto(material);
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
    const current = await this.prisma.material.findUnique({ where: { id } });

    if (!current) {
      throw new NotFoundException(`Material com id ${id} não encontrado`);
    }

    const name = dto.name !== undefined ? normalizeName(dto.name) : undefined;
    const tags = dto.tags !== undefined ? sortTags(dto.tags) : undefined;

    if (name !== undefined || tags !== undefined) {
      const effectiveName = name ?? current.name;
      const effectiveTags = tags ?? current.tags;

      const existing = await this.prisma.material.findFirst({
        where: {
          name: { equals: effectiveName, mode: 'insensitive' },
          tags: { equals: effectiveTags },
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Já existe um material com o nome "${effectiveName}" e a(s) mesma(s) etiqueta(s)`,
        );
      }
    }

    const material = await this.prisma.material.update({
      where: { id },
      data: {
        name,
        tags,
        referenceQuantity: dto.referenceQuantity,
      },
    });

    return this.toOutputDto(material);
  }

  async getStats(
    id: string,
    query: MaterialStatsQueryDTO,
  ): Promise<MaterialStatsOutputDTO> {
    const material = await this.prisma.material.findUnique({ where: { id } });

    if (!material) {
      throw new NotFoundException(`Material com id ${id} não encontrado`);
    }

    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    const createdAt = from || to ? { gte: from, lte: to } : undefined;

    const [withdrawals, returns] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where: { materialId: id, createdAt },
        select: { quantity: true, createdAt: true },
      }),
      this.prisma.return.findMany({
        where: { materialId: id, createdAt },
        select: { quantity: true, createdAt: true },
      }),
    ]);

    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.quantity, 0);
    const totalReturned = returns.reduce((sum, r) => sum + r.quantity, 0);

    const timelineMap = new Map<
      string,
      { withdrawn: number; returned: number }
    >();

    for (const withdrawal of withdrawals) {
      const day = withdrawal.createdAt.toISOString().slice(0, 10);
      const point = timelineMap.get(day) ?? { withdrawn: 0, returned: 0 };
      point.withdrawn += withdrawal.quantity;
      timelineMap.set(day, point);
    }

    for (const stockReturn of returns) {
      const day = stockReturn.createdAt.toISOString().slice(0, 10);
      const point = timelineMap.get(day) ?? { withdrawn: 0, returned: 0 };
      point.returned += stockReturn.quantity;
      timelineMap.set(day, point);
    }

    const timeline = Array.from(timelineMap.entries())
      .sort(([dayA], [dayB]) => (dayA < dayB ? -1 : 1))
      .map(
        ([date, point]) =>
          new MaterialStatsTimelinePointDTO(
            date,
            point.withdrawn,
            point.returned,
          ),
      );

    const { percentage, lowStockAlert } = this.computeAlert(material);

    return new MaterialStatsOutputDTO({
      materialId: material.id,
      name: material.name,
      type: material.type,
      currentQuantity: material.currentQuantity,
      referenceQuantity: material.referenceQuantity,
      percentage,
      lowStockAlert,
      from: query.from ?? null,
      to: query.to ?? null,
      totalWithdrawn,
      totalReturned,
      timeline,
    });
  }

  private computeAlert(material: Material): {
    percentage: number | null;
    lowStockAlert: boolean;
  } {
    const percentage = material.referenceQuantity
      ? (material.currentQuantity / material.referenceQuantity) * 100
      : null;

    const lowStockAlert =
      material.type === MaterialType.SIMPLE &&
      percentage !== null &&
      percentage <= 50;

    return { percentage, lowStockAlert };
  }

  private toOutputDto(material: Material): MaterialOutputDTO {
    const { percentage, lowStockAlert } = this.computeAlert(material);

    return new MaterialOutputDTO(material, percentage, lowStockAlert);
  }
}
