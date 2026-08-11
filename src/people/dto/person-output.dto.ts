import { Person } from '@prisma/client';

export class PersonOutputDTO {
  id: string;
  name: string;
  contact: string | null;
  politicalReferenceId: string;
  createdAt: Date;

  constructor(person: Person) {
    this.id = person.id;
    this.name = person.name;
    this.contact = person.contact;
    this.politicalReferenceId = person.politicalReferenceId;
    this.createdAt = person.createdAt;
  }
}
