import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateReturnDTO {
  @IsUUID(undefined, { message: 'materialId deve ser um uuid válido' })
  materialId: string;

  @IsUUID(undefined, { message: 'occasionId deve ser um uuid válido' })
  occasionId: string;

  @IsInt({ message: 'quantity deve ser um número inteiro' })
  @Min(1, { message: 'quantity deve ser maior que zero' })
  quantity: number;
}
