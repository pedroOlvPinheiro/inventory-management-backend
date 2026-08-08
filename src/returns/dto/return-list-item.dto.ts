import { Return } from '@prisma/client';

export class ReturnListItemDTO {
  id: string;
  materialId: string;
  occasionId: string;
  quantity: number;
  createdAt: Date;

  constructor(returnEntity: Return) {
    this.id = returnEntity.id;
    this.materialId = returnEntity.materialId;
    this.occasionId = returnEntity.occasionId;
    this.quantity = returnEntity.quantity;
    this.createdAt = returnEntity.createdAt;
  }
}
