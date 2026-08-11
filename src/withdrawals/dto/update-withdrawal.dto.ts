import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateWithdrawalDTO {
  @IsOptional()
  @IsInt({ message: 'quantity deve ser um número inteiro' })
  @Min(1, { message: 'quantity deve ser maior que zero' })
  quantity?: number;

  @IsOptional()
  @IsUUID(undefined, { message: 'personId deve ser um uuid válido' })
  personId?: string;

  @IsOptional()
  @IsUUID(undefined, { message: 'occasionId deve ser um uuid válido' })
  occasionId?: string;
}
