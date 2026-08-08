import { Return } from '@prisma/client';

export class ReturnOutputDTO {
  materialId: string;
  occasionId: string;
  quantity: number;
  createdAt: Date;
  warning?: string;

  constructor(returnEntity: Return, warning?: string) {
    this.materialId = returnEntity.materialId;
    this.occasionId = returnEntity.occasionId;
    this.quantity = returnEntity.quantity;
    this.createdAt = returnEntity.createdAt;
    this.warning = warning;
  }
}
