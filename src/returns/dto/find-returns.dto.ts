import { IsOptional, IsUUID } from 'class-validator';

export class FindReturnsDTO {
  @IsOptional()
  @IsUUID(undefined, { message: 'materialId deve ser um uuid válido' })
  materialId?: string;

  @IsOptional()
  @IsUUID(undefined, { message: 'occasionId deve ser um uuid válido' })
  occasionId?: string;
}
