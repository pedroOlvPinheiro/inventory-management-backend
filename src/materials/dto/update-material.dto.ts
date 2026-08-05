import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateMaterialDTO } from './create-material.dto';

export class UpdateMaterialDTO extends PartialType(CreateMaterialDTO) {
  @IsOptional()
  @IsInt({ message: 'referenceQuantity deve ser um número inteiro' })
  @Min(1, { message: 'referenceQuantity deve ser maior que zero' })
  referenceQuantity?: number;
}
