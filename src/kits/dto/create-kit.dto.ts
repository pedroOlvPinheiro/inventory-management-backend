import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateKitComponentDTO {
  @IsUUID(undefined, { message: 'materialId deve ser um uuid válido' })
  materialId: string;

  @IsInt({ message: 'quantityPerKit deve ser um número inteiro' })
  @Min(1, { message: 'quantityPerKit deve ser maior que zero' })
  quantityPerKit: number;
}

export class CreateKitDTO {
  @IsString({ message: 'name deve ser um texto' })
  @IsNotEmpty({ message: 'name não pode estar vazio' })
  name: string;

  @IsArray({ message: 'components deve ser uma lista' })
  @ArrayMinSize(1, { message: 'components deve ter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => CreateKitComponentDTO)
  components: CreateKitComponentDTO[];
}
