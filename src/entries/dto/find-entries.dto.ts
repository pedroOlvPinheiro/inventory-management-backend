import { IsOptional, IsUUID } from 'class-validator';

export class FindEntriesDTO {
  @IsOptional()
  @IsUUID(undefined, { message: 'materialId deve ser um uuid válido' })
  materialId?: string;
}
