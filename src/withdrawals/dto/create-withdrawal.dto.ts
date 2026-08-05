import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateWithdrawalDTO {
  @IsUUID(undefined, { message: 'materialId deve ser um uuid válido' })
  materialId: string;

  @IsInt({ message: 'quantity deve ser um número inteiro' })
  @Min(1, { message: 'quantity deve ser maior que zero' })
  quantity: number;

  @IsString({ message: 'responsibleName deve ser um texto' })
  @IsNotEmpty({ message: 'responsibleName não pode estar vazio' })
  responsibleName: string;

  @IsOptional()
  @IsUUID(undefined, { message: 'occasionId deve ser um uuid válido' })
  occasionId?: string;

  @IsOptional()
  @IsString({ message: 'occasionName deve ser um texto' })
  @IsNotEmpty({ message: 'occasionName não pode estar vazio' })
  occasionName?: string;
}
