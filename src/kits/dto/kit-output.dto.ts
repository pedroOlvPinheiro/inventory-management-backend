import { Material, MaterialType } from '@prisma/client';

export class KitComponentOutputDTO {
  materialId: string;
  materialName: string;
  quantityPerKit: number;

  constructor(
    materialId: string,
    materialName: string,
    quantityPerKit: number,
  ) {
    this.materialId = materialId;
    this.materialName = materialName;
    this.quantityPerKit = quantityPerKit;
  }
}

export class KitOutputDTO {
  id: string;
  name: string;
  type: MaterialType;
  currentQuantity: number;
  referenceQuantity: number | null;
  percentage: number | null;
  lowStockAlert: boolean;
  components: KitComponentOutputDTO[];
  warning?: string;

  constructor(
    material: Material,
    percentage: number | null,
    lowStockAlert: boolean,
    components: KitComponentOutputDTO[],
    warning?: string,
  ) {
    this.id = material.id;
    this.name = material.name;
    this.type = material.type;
    this.currentQuantity = material.currentQuantity;
    this.referenceQuantity = material.referenceQuantity;
    this.percentage = percentage;
    this.lowStockAlert = lowStockAlert;
    this.components = components;
    this.warning = warning;
  }
}
