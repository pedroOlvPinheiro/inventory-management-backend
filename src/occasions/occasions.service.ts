import { ConflictException, Injectable } from '@nestjs/common';
import { Occasion, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOccasionDTO } from './dto/create-occasion.dto';
import { OccasionOutputDTO } from './dto/occasion-output.dto';
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

  private toOutputDto(occasion: Occasion): OccasionOutputDTO {
    return new OccasionOutputDTO(occasion);
  }
}
