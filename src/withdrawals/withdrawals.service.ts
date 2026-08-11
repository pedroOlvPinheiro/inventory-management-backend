import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeName } from '../utils/normalize-name.util';
import { CreateWithdrawalDTO } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalDTO } from './dto/update-withdrawal.dto';
import { WithdrawalOutputDTO } from './dto/withdrawal-output.dto';

@Injectable()
export class WithdrawalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWithdrawalDTO): Promise<WithdrawalOutputDTO> {
    if (!dto.occasionId && !dto.occasionName) {
      throw new BadRequestException('Informe occasionId ou occasionName');
    }

    if (dto.occasionId && dto.occasionName) {
      throw new BadRequestException(
        'Informe apenas occasionId ou occasionName, não os dois',
      );
    }

    if (!dto.personId && !dto.personName) {
      throw new BadRequestException('Informe personId ou personName');
    }

    if (dto.personId && dto.personName) {
      throw new BadRequestException(
        'Informe apenas personId ou personName, não os dois',
      );
    }

    const { withdrawal, warning } = await this.prisma.$transaction(
      async (tx) => {
        const material = await tx.material.findUnique({
          where: { id: dto.materialId },
        });

        if (!material) {
          throw new NotFoundException(
            `Material com id ${dto.materialId} não encontrado`,
          );
        }

        let occasionId: string;

        if (dto.occasionId) {
          const occasion = await tx.occasion.findUnique({
            where: { id: dto.occasionId },
          });

          if (!occasion) {
            throw new NotFoundException(
              `Ocasião com id ${dto.occasionId} não encontrada`,
            );
          }

          occasionId = occasion.id;
        } else {
          const name = normalizeName(dto.occasionName as string);

          const existingOccasion = await tx.occasion.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } },
          });

          occasionId = existingOccasion
            ? existingOccasion.id
            : (await tx.occasion.create({ data: { name } })).id;
        }

        let personId: string;

        if (dto.personId) {
          const person = await tx.person.findUnique({
            where: { id: dto.personId },
          });

          if (!person) {
            throw new NotFoundException(
              `Pessoa com id ${dto.personId} não encontrada`,
            );
          }

          personId = person.id;
        } else {
          const personName = normalizeName(dto.personName as string);

          const existingPerson = await tx.person.findFirst({
            where: { name: { equals: personName, mode: 'insensitive' } },
          });

          if (existingPerson) {
            personId = existingPerson.id;
          } else {
            if (!dto.politicalReferenceId && !dto.politicalReferenceName) {
              throw new BadRequestException(
                'Informe politicalReferenceId ou politicalReferenceName para cadastrar uma nova pessoa',
              );
            }

            if (dto.politicalReferenceId && dto.politicalReferenceName) {
              throw new BadRequestException(
                'Informe apenas politicalReferenceId ou politicalReferenceName, não os dois',
              );
            }

            let politicalReferenceId: string;

            if (dto.politicalReferenceId) {
              const politicalReference = await tx.politicalReference.findUnique(
                {
                  where: { id: dto.politicalReferenceId },
                },
              );

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

            const createdPerson = await tx.person.create({
              data: {
                name: personName,
                contact: dto.personContact,
                politicalReferenceId,
              },
            });

            personId = createdPerson.id;
          }
        }

        const createdWithdrawal = await tx.withdrawal.create({
          data: {
            materialId: dto.materialId,
            quantity: dto.quantity,
            personId,
            occasionId,
          },
        });

        await tx.material.update({
          where: { id: dto.materialId },
          data: { currentQuantity: { decrement: dto.quantity } },
        });

        const resultingQuantity = material.currentQuantity - dto.quantity;
        const resultingWarning =
          resultingQuantity < 0
            ? `Estoque insuficiente: saldo ficará em ${resultingQuantity}.`
            : undefined;

        return { withdrawal: createdWithdrawal, warning: resultingWarning };
      },
    );

    return new WithdrawalOutputDTO(withdrawal, warning);
  }

  async update(
    id: string,
    dto: UpdateWithdrawalDTO,
  ): Promise<WithdrawalOutputDTO> {
    const { withdrawal, warning } = await this.prisma.$transaction(
      async (tx) => {
        const existingWithdrawal = await tx.withdrawal.findUnique({
          where: { id },
        });

        if (!existingWithdrawal) {
          throw new NotFoundException(`Retirada com id ${id} não encontrada`);
        }

        if (dto.occasionId) {
          const occasion = await tx.occasion.findUnique({
            where: { id: dto.occasionId },
          });

          if (!occasion) {
            throw new NotFoundException(
              `Ocasião com id ${dto.occasionId} não encontrada`,
            );
          }
        }

        if (dto.personId) {
          const person = await tx.person.findUnique({
            where: { id: dto.personId },
          });

          if (!person) {
            throw new NotFoundException(
              `Pessoa com id ${dto.personId} não encontrada`,
            );
          }
        }

        const delta =
          dto.quantity !== undefined
            ? dto.quantity - existingWithdrawal.quantity
            : 0;

        const updatedWithdrawal = await tx.withdrawal.update({
          where: { id },
          data: {
            quantity: dto.quantity,
            personId: dto.personId,
            occasionId: dto.occasionId,
          },
        });

        let resultingWarning: string | undefined;

        if (delta !== 0) {
          const updatedMaterial = await tx.material.update({
            where: { id: existingWithdrawal.materialId },
            data: { currentQuantity: { decrement: delta } },
          });

          resultingWarning =
            updatedMaterial.currentQuantity < 0
              ? `Estoque insuficiente: saldo ficará em ${updatedMaterial.currentQuantity} após a edição.`
              : undefined;
        }

        return { withdrawal: updatedWithdrawal, warning: resultingWarning };
      },
    );

    return new WithdrawalOutputDTO(withdrawal, warning);
  }

  async findAll(
    materialId?: string,
    occasionId?: string,
  ): Promise<WithdrawalOutputDTO[]> {
    const withdrawals = await this.prisma.withdrawal.findMany({
      where: {
        materialId,
        occasionId,
      },
    });

    return withdrawals.map((withdrawal) => new WithdrawalOutputDTO(withdrawal));
  }
}
