import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { MaterialType } from '@prisma/client';

export class FindMaterialsDTO {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(MaterialType, {
    message: 'type deve ser um dos seguintes valores: SIMPLE, KIT',
  })
  type?: MaterialType;
}
