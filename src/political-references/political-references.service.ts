import { ConflictException, Injectable } from '@nestjs/common';
import { PoliticalReference, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeName } from '../utils/normalize-name.util';
import { CreatePoliticalReferenceDTO } from './dto/create-political-reference.dto';
import { PoliticalReferenceOutputDTO } from './dto/political-reference-output.dto';

@Injectable()
export class PoliticalReferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreatePoliticalReferenceDTO,
  ): Promise<PoliticalReferenceOutputDTO> {
    const name = normalizeName(dto.name);

    const existing = await this.prisma.politicalReference.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe uma referência com o nome "${name}"`,
      );
    }

    try {
      const politicalReference = await this.prisma.politicalReference.create({
        data: { name },
      });

      return this.toOutputDto(politicalReference);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Já existe uma referência com o nome "${name}"`,
        );
      }

      throw error;
    }
  }

  async findAll(): Promise<PoliticalReferenceOutputDTO[]> {
    const politicalReferences = await this.prisma.politicalReference.findMany();

    return politicalReferences.map((politicalReference) =>
      this.toOutputDto(politicalReference),
    );
  }

  private toOutputDto(
    politicalReference: PoliticalReference,
  ): PoliticalReferenceOutputDTO {
    return new PoliticalReferenceOutputDTO(politicalReference);
  }
}
