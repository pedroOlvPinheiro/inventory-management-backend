import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PoliticalTag } from '@prisma/client';

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

  @IsArray({ message: 'tags deve ser uma lista' })
  @ArrayMinSize(1, { message: 'tags deve ter pelo menos uma etiqueta' })
  @ArrayMaxSize(3, { message: 'tags pode ter no máximo 3 etiquetas' })
  @ArrayUnique({ message: 'tags não pode ter etiquetas repetidas' })
  @IsEnum(PoliticalTag, {
    each: true,
    message:
      'tags deve conter apenas: PAULO_CASE, PEDRO_LUCAS, ORLEANS_BRANDAO',
  })
  tags: PoliticalTag[];

  @IsArray({ message: 'components deve ser uma lista' })
  @ArrayMinSize(1, { message: 'components deve ter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => CreateKitComponentDTO)
  components: CreateKitComponentDTO[];
}
