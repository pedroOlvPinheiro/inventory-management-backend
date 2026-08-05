import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMaterialDTO {
  @IsString({ message: 'name deve ser um texto' })
  @IsNotEmpty({ message: 'name não pode estar vazio' })
  name: string;
}
