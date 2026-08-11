import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateWithdrawalBatchItemDTO {
  @IsUUID(undefined, { message: 'materialId deve ser um uuid válido' })
  materialId: string;

  @IsInt({ message: 'quantity deve ser um número inteiro' })
  @Min(1, { message: 'quantity deve ser maior que zero' })
  quantity: number;
}

export class CreateWithdrawalBatchDTO {
  @IsArray({ message: 'items deve ser uma lista' })
  @ArrayMinSize(1, { message: 'items deve ter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => CreateWithdrawalBatchItemDTO)
  items: CreateWithdrawalBatchItemDTO[];

  @IsOptional()
  @IsUUID(undefined, { message: 'personId deve ser um uuid válido' })
  personId?: string;

  @IsOptional()
  @IsString({ message: 'personName deve ser um texto' })
  @IsNotEmpty({ message: 'personName não pode estar vazio' })
  personName?: string;

  @IsOptional()
  @IsString({ message: 'personContact deve ser um texto' })
  personContact?: string;

  @IsOptional()
  @IsUUID(undefined, {
    message: 'politicalReferenceId deve ser um uuid válido',
  })
  politicalReferenceId?: string;

  @IsOptional()
  @IsString({ message: 'politicalReferenceName deve ser um texto' })
  @IsNotEmpty({ message: 'politicalReferenceName não pode estar vazio' })
  politicalReferenceName?: string;

  @IsOptional()
  @IsUUID(undefined, { message: 'occasionId deve ser um uuid válido' })
  occasionId?: string;

  @IsOptional()
  @IsString({ message: 'occasionName deve ser um texto' })
  @IsNotEmpty({ message: 'occasionName não pode estar vazio' })
  occasionName?: string;
}
