import { IsInt, Min } from 'class-validator';

export class AssembleKitDTO {
  @IsInt({ message: 'quantity deve ser um número inteiro' })
  @Min(1, { message: 'quantity deve ser maior que zero' })
  quantity: number;
}
