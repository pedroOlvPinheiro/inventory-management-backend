import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeName } from '../utils/normalize-name.util';
import { CreatePersonDTO } from './dto/create-person.dto';
import { PersonOutputDTO } from './dto/person-output.dto';

@Injectable()
export class PeopleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePersonDTO): Promise<PersonOutputDTO> {
    if (!dto.politicalReferenceId && !dto.politicalReferenceName) {
      throw new BadRequestException(
        'Informe politicalReferenceId ou politicalReferenceName',
      );
    }

    if (dto.politicalReferenceId && dto.politicalReferenceName) {
      throw new BadRequestException(
        'Informe apenas politicalReferenceId ou politicalReferenceName, não os dois',
      );
    }

    const name = normalizeName(dto.name);

    const existing = await this.prisma.person.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existing) {
      throw new ConflictException(`Já existe uma pessoa com o nome "${name}"`);
    }

    const person = await this.prisma.$transaction(async (tx) => {
      let politicalReferenceId: string;

      if (dto.politicalReferenceId) {
        const politicalReference = await tx.politicalReference.findUnique({
          where: { id: dto.politicalReferenceId },
        });

        if (!politicalReference) {
          throw new NotFoundException(
            `Referência com id ${dto.politicalReferenceId} não encontrada`,
          );
        }

        politicalReferenceId = politicalReference.id;
      } else {
        const referenceName = normalizeName(
          dto.politicalReferenceName as string,
        );

        const existingReference = await tx.politicalReference.findFirst({
          where: { name: { equals: referenceName, mode: 'insensitive' } },
        });

        politicalReferenceId = existingReference
          ? existingReference.id
          : (
              await tx.politicalReference.create({
                data: { name: referenceName },
              })
            ).id;
      }

      try {
        return await tx.person.create({
          data: {
            name,
            contact: dto.contact,
            politicalReferenceId,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException(
            `Já existe uma pessoa com o nome "${name}"`,
          );
        }

        throw error;
      }
    });

    return new PersonOutputDTO(person);
  }

  async findAll(): Promise<PersonOutputDTO[]> {
    const people = await this.prisma.person.findMany();

    return people.map((person) => new PersonOutputDTO(person));
  }
}
