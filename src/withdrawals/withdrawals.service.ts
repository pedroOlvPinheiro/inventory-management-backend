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

        const createdWithdrawal = await tx.withdrawal.create({
          data: {
            materialId: dto.materialId,
            quantity: dto.quantity,
            responsibleName: dto.responsibleName,
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

        const delta =
          dto.quantity !== undefined
            ? dto.quantity - existingWithdrawal.quantity
            : 0;

        const updatedWithdrawal = await tx.withdrawal.update({
          where: { id },
          data: {
            quantity: dto.quantity,
            responsibleName: dto.responsibleName,
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
