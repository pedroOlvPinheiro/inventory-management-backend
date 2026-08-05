import { Occasion } from '@prisma/client';

export class OccasionOutputDTO {
  id: string;
  name: string;

  constructor(occasion: Occasion) {
    this.id = occasion.id;
    this.name = occasion.name;
  }
}
