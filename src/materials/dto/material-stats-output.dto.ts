export class MaterialStatsTimelinePointDTO {
  date: string;
  withdrawn: number;
  returned: number;

  constructor(date: string, withdrawn: number, returned: number) {
    this.date = date;
    this.withdrawn = withdrawn;
    this.returned = returned;
  }
}

export class MaterialStatsOutputDTO {
  materialId: string;
  name: string;
  type: string;
  currentQuantity: number;
  referenceQuantity: number | null;
  percentage: number | null;
  lowStockAlert: boolean;
  from: string | null;
  to: string | null;
  totalWithdrawn: number;
  totalReturned: number;
  netConsumption: number;
  timeline: MaterialStatsTimelinePointDTO[];

  constructor(params: {
    materialId: string;
    name: string;
    type: string;
    currentQuantity: number;
    referenceQuantity: number | null;
    percentage: number | null;
    lowStockAlert: boolean;
    from: string | null;
    to: string | null;
    totalWithdrawn: number;
    totalReturned: number;
    timeline: MaterialStatsTimelinePointDTO[];
  }) {
    this.materialId = params.materialId;
    this.name = params.name;
    this.type = params.type;
    this.currentQuantity = params.currentQuantity;
    this.referenceQuantity = params.referenceQuantity;
    this.percentage = params.percentage;
    this.lowStockAlert = params.lowStockAlert;
    this.from = params.from;
    this.to = params.to;
    this.totalWithdrawn = params.totalWithdrawn;
    this.totalReturned = params.totalReturned;
    this.netConsumption = params.totalWithdrawn - params.totalReturned;
    this.timeline = params.timeline;
  }
}
