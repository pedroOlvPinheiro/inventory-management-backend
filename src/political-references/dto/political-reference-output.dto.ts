import { PoliticalReference } from '@prisma/client';

export class PoliticalReferenceOutputDTO {
  id: string;
  name: string;

  constructor(politicalReference: PoliticalReference) {
    this.id = politicalReference.id;
    this.name = politicalReference.name;
  }
}
