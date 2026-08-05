import { StockEntry } from '@prisma/client';

export class EntryOutputDTO {
  id: string;
  materialId: string;
  quantity: number;
  createdAt: Date;

  constructor(entry: StockEntry) {
    this.id = entry.id;
    this.materialId = entry.materialId;
    this.quantity = entry.quantity;
    this.createdAt = entry.createdAt;
  }
}
