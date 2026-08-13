import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateEntryDTO {
  @IsUUID(undefined, { message: 'materialId deve ser um uuid válido' })
  materialId: string;

  @IsInt({ message: 'quantity deve ser um número inteiro' })
  @Min(1, { message: 'quantity deve ser maior que zero' })
  quantity: number;

  @IsOptional()
  @IsDateString(undefined, { message: 'createdAt deve ser uma data válida' })
  createdAt?: string;
}
