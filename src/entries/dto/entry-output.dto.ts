import { StockEntry } from '@prisma/client';

export class EntryOutputDTO {
  id: string;
  materialId: string;
  quantity: number;
  createdAt: Date;
  warning?: string;

  constructor(entry: StockEntry, warning?: string) {
    this.id = entry.id;
    this.materialId = entry.materialId;
    this.quantity = entry.quantity;
    this.createdAt = entry.createdAt;
    this.warning = warning;
  }
}
