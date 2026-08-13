import { Material, MaterialType, PoliticalTag } from '@prisma/client';

export class MaterialOutputDTO {
  id: string;
  name: string;
  type: MaterialType;
  tags: PoliticalTag[];
  currentQuantity: number;
  referenceQuantity: number | null;
  percentage: number | null;
  lowStockAlert: boolean;

  constructor(
    material: Material,
    percentage: number | null,
    lowStockAlert: boolean,
  ) {
    this.id = material.id;
    this.name = material.name;
    this.type = material.type;
    this.tags = material.tags;
    this.currentQuantity = material.currentQuantity;
    this.referenceQuantity = material.referenceQuantity;
    this.percentage = percentage;
    this.lowStockAlert = lowStockAlert;
  }
}
