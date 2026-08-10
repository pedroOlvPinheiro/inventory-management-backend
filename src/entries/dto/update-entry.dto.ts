import { IsInt, Min } from 'class-validator';

export class UpdateEntryDTO {
  @IsInt({ message: 'quantity deve ser um número inteiro' })
  @Min(1, { message: 'quantity deve ser maior que zero' })
  quantity: number;
}
