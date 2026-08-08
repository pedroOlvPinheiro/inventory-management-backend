import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDTO } from './dto/create-return.dto';
import { ReturnOutputDTO } from './dto/return-output.dto';
import { ReturnListItemDTO } from './dto/return-list-item.dto';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReturnDTO): Promise<ReturnOutputDTO> {
    const { returnEntity, warning } = await this.prisma.$transaction(
      async (tx) => {
        const material = await tx.material.findUnique({
          where: { id: dto.materialId },
        });

        if (!material) {
          throw new NotFoundException(
            `Material com id ${dto.materialId} não encontrado`,
          );
        }

        const occasion = await tx.occasion.findUnique({
          where: { id: dto.occasionId },
        });

        if (!occasion) {
          throw new NotFoundException(
            `Ocasião com id ${dto.occasionId} não encontrada`,
          );
        }

        const createdReturn = await tx.return.create({
          data: {
            materialId: dto.materialId,
            occasionId: dto.occasionId,
            quantity: dto.quantity,
          },
        });

        await tx.material.update({
          where: { id: dto.materialId },
          data: { currentQuantity: { increment: dto.quantity } },
        });

        const [withdrawnTotal, returnedTotal] = await Promise.all([
          tx.withdrawal.aggregate({
            where: { materialId: dto.materialId, occasionId: dto.occasionId },
            _sum: { quantity: true },
          }),
          tx.return.aggregate({
            where: { materialId: dto.materialId, occasionId: dto.occasionId },
            _sum: { quantity: true },
          }),
        ]);

        const totalWithdrawn = withdrawnTotal._sum.quantity ?? 0;
        const totalReturned = returnedTotal._sum.quantity ?? 0;

        const resultingWarning =
          totalReturned > totalWithdrawn
            ? `Total retornado (${totalReturned}) excede o total retirado (${totalWithdrawn}) para este material na ocasião "${occasion.name}".`
            : undefined;

        return { returnEntity: createdReturn, warning: resultingWarning };
      },
    );

    return new ReturnOutputDTO(returnEntity, warning);
  }

  async findAll(
    materialId?: string,
    occasionId?: string,
  ): Promise<ReturnListItemDTO[]> {
    const returns = await this.prisma.return.findMany({
      where: { materialId, occasionId },
    });

    return returns.map((returnEntity) => new ReturnListItemDTO(returnEntity));
  }
}
