import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePersonDTO {
  @IsString({ message: 'name deve ser um texto' })
  @IsNotEmpty({ message: 'name não pode estar vazio' })
  name: string;

  @IsOptional()
  @IsString({ message: 'contact deve ser um texto' })
  contact?: string;

  @IsOptional()
  @IsUUID(undefined, {
    message: 'politicalReferenceId deve ser um uuid válido',
  })
  politicalReferenceId?: string;

  @IsOptional()
  @IsString({ message: 'politicalReferenceName deve ser um texto' })
  @IsNotEmpty({ message: 'politicalReferenceName não pode estar vazio' })
  politicalReferenceName?: string;
}
