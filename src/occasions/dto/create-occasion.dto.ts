import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOccasionDTO {
  @IsString({ message: 'name deve ser um texto' })
  @IsNotEmpty({ message: 'name não pode estar vazio' })
  name: string;
}
