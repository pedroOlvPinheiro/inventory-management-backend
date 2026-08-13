import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { PoliticalTag } from '@prisma/client';

export class CreateMaterialDTO {
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
}
