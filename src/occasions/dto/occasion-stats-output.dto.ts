export class OccasionStatsMaterialDTO {
  materialId: string;
  materialName: string;
  withdrawn: number;
  returned: number;

  constructor(
    materialId: string,
    materialName: string,
    withdrawn: number,
    returned: number,
  ) {
    this.materialId = materialId;
    this.materialName = materialName;
    this.withdrawn = withdrawn;
    this.returned = returned;
  }
}

export class OccasionStatsPersonDTO {
  personId: string;
  personName: string;
  totalWithdrawn: number;

  constructor(personId: string, personName: string, totalWithdrawn: number) {
    this.personId = personId;
    this.personName = personName;
    this.totalWithdrawn = totalWithdrawn;
  }
}

export class OccasionStatsOutputDTO {
  occasionId: string;
  name: string;
  from: string | null;
  to: string | null;
  totalWithdrawn: number;
  totalReturned: number;
  netConsumption: number;
  materials: OccasionStatsMaterialDTO[];
  people: OccasionStatsPersonDTO[];

  constructor(params: {
    occasionId: string;
    name: string;
    from: string | null;
    to: string | null;
    totalWithdrawn: number;
    totalReturned: number;
    materials: OccasionStatsMaterialDTO[];
    people: OccasionStatsPersonDTO[];
  }) {
    this.occasionId = params.occasionId;
    this.name = params.name;
    this.from = params.from;
    this.to = params.to;
    this.totalWithdrawn = params.totalWithdrawn;
    this.totalReturned = params.totalReturned;
    this.netConsumption = params.totalWithdrawn - params.totalReturned;
    this.materials = params.materials;
    this.people = params.people;
  }
}
