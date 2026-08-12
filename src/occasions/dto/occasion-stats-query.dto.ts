import { IsDateString, IsOptional } from 'class-validator';

export class OccasionStatsQueryDTO {
  @IsOptional()
  @IsDateString(undefined, {
    message: 'from deve ser uma data válida (ISO 8601)',
  })
  from?: string;

  @IsOptional()
  @IsDateString(undefined, {
    message: 'to deve ser uma data válida (ISO 8601)',
  })
  to?: string;
}
