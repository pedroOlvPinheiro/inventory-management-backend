import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma, Withdrawal } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeName } from '../utils/normalize-name.util';
import { CreateWithdrawalDTO } from './dto/create-withdrawal.dto';
import { CreateWithdrawalBatchDTO } from './dto/create-withdrawal-batch.dto';
import { UpdateWithdrawalDTO } from './dto/update-withdrawal.dto';
import { WithdrawalOutputDTO } from './dto/withdrawal-output.dto';
import { WithdrawalBatchOutputDTO } from './dto/withdrawal-batch-output.dto';

interface OccasionRefParams {
  occasionId?: string;
  occasionName?: string;
}

interface PersonRefParams {
  personId?: string;
  personName?: string;
  personContact?: string;
  politicalReferenceId?: string;
  politicalReferenceName?: string;
}

@Injectable()
export class WithdrawalsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveOccasionId(
    tx: Prisma.TransactionClient,
    params: OccasionRefParams,
  ): Promise<string> {
    if (!params.occasionId && !params.occasionName) {
      throw new BadRequestException('Informe occasionId ou occasionName');
    }

    if (params.occasionId && params.occasionName) {
      throw new BadRequestException(
        'Informe apenas occasionId ou occasionName, não os dois',
      );
    }

    if (params.occasionId) {
      const occasion = await tx.occasion.findUnique({
        where: { id: params.occasionId },
      });

      if (!occasion) {
        throw new NotFoundException(
          `Ocasião com id ${params.occasionId} não encontrada`,
        );
      }

      return occasion.id;
    }

    const name = normalizeName(params.occasionName as string);

    const existingOccasion = await tx.occasion.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    return existingOccasion
      ? existingOccasion.id
      : (await tx.occasion.create({ data: { name } })).id;
  }

  private async resolvePoliticalReferenceId(
    tx: Prisma.TransactionClient,
    params: PersonRefParams,
  ): Promise<string> {
    if (!params.politicalReferenceId && !params.politicalReferenceName) {
      throw new BadRequestException(
        'Informe politicalReferenceId ou politicalReferenceName para cadastrar uma nova pessoa',
      );
    }

    if (params.politicalReferenceId && params.politicalReferenceName) {
      throw new BadRequestException(
        'Informe apenas politicalReferenceId ou politicalReferenceName, não os dois',
      );
    }

    if (params.politicalReferenceId) {
      const politicalReference = await tx.politicalReference.findUnique({
        where: { id: params.politicalReferenceId },
      });

      if (!politicalReference) {
        throw new NotFoundException(
          `Referência com id ${params.politicalReferenceId} não encontrada`,
        );
      }

      return politicalReference.id;
    }

    const referenceName = normalizeName(
      params.politicalReferenceName as string,
    );

    const existingReference = await tx.politicalReference.findFirst({
      where: { name: { equals: referenceName, mode: 'insensitive' } },
    });

    return existingReference
      ? existingReference.id
      : (await tx.politicalReference.create({ data: { name: referenceName } }))
          .id;
  }

  private async resolvePersonId(
    tx: Prisma.TransactionClient,
    params: PersonRefParams,
  ): Promise<string> {
    if (!params.personId && !params.personName) {
      throw new BadRequestException('Informe personId ou personName');
    }

    if (params.personId && params.personName) {
      throw new BadRequestException(
        'Informe apenas personId ou personName, não os dois',
      );
    }

    if (params.personId) {
      const person = await tx.person.findUnique({
        where: { id: params.personId },
      });

      if (!person) {
        throw new NotFoundException(
          `Pessoa com id ${params.personId} não encontrada`,
        );
      }

      return person.id;
    }

    const personName = normalizeName(params.personName as string);

    const existingPerson = await tx.person.findFirst({
      where: { name: { equals: personName, mode: 'insensitive' } },
    });

    if (existingPerson) {
      return existingPerson.id;
    }

    const politicalReferenceId = await this.resolvePoliticalReferenceId(
      tx,
      params,
    );

    const createdPerson = await tx.person.create({
      data: {
        name: personName,
        contact: params.personContact,
        politicalReferenceId,
      },
    });

    return createdPerson.id;
  }

  async create(dto: CreateWithdrawalDTO): Promise<WithdrawalOutputDTO> {
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

        const occasionId = await this.resolveOccasionId(tx, dto);
        const personId = await this.resolvePersonId(tx, dto);

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

  async createBatch(
    dto: CreateWithdrawalBatchDTO,
  ): Promise<WithdrawalBatchOutputDTO> {
    const withdrawalGroupId = randomUUID();

    const { occasionId, personId, items } = await this.prisma.$transaction(
      async (tx) => {
        const occasionId = await this.resolveOccasionId(tx, dto);
        const personId = await this.resolvePersonId(tx, dto);

        const items: { withdrawal: Withdrawal; warning?: string }[] = [];

        for (const item of dto.items) {
          const material = await tx.material.findUnique({
            where: { id: item.materialId },
          });

          if (!material) {
            throw new NotFoundException(
              `Material com id ${item.materialId} não encontrado`,
            );
          }

          const createdWithdrawal = await tx.withdrawal.create({
            data: {
              materialId: item.materialId,
              quantity: item.quantity,
              personId,
              occasionId,
              withdrawalGroupId,
            },
          });

          await tx.material.update({
            where: { id: item.materialId },
            data: { currentQuantity: { decrement: item.quantity } },
          });

          const resultingQuantity = material.currentQuantity - item.quantity;
          const warning =
            resultingQuantity < 0
              ? `Estoque insuficiente: saldo ficará em ${resultingQuantity}.`
              : undefined;

          items.push({ withdrawal: createdWithdrawal, warning });
        }

        return { occasionId, personId, items };
      },
    );

    return new WithdrawalBatchOutputDTO(
      withdrawalGroupId,
      personId,
      occasionId,
      items.map(
        ({ withdrawal, warning }) =>
          new WithdrawalOutputDTO(withdrawal, warning),
      ),
    );
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

  async findBatch(
    withdrawalGroupId: string,
  ): Promise<WithdrawalBatchOutputDTO> {
    const withdrawals = await this.prisma.withdrawal.findMany({
      where: { withdrawalGroupId },
    });

    if (withdrawals.length === 0) {
      throw new NotFoundException(
        `Grupo de retiradas com id ${withdrawalGroupId} não encontrado`,
      );
    }

    const [firstWithdrawal] = withdrawals;

    return new WithdrawalBatchOutputDTO(
      withdrawalGroupId,
      firstWithdrawal.personId,
      firstWithdrawal.occasionId,
      withdrawals.map((withdrawal) => new WithdrawalOutputDTO(withdrawal)),
    );
  }
}
