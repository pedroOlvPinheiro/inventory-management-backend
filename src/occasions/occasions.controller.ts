import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { OccasionsService } from './occasions.service';
import { CreateOccasionDTO } from './dto/create-occasion.dto';
import { OccasionOutputDTO } from './dto/occasion-output.dto';
import { OccasionStatsQueryDTO } from './dto/occasion-stats-query.dto';
import { OccasionStatsOutputDTO } from './dto/occasion-stats-output.dto';

const occasionIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException('id deve ser um uuid válido'),
});

@Controller('occasions')
export class OccasionsController {
  constructor(private readonly occasionsService: OccasionsService) {}

  @Post()
  create(@Body() dto: CreateOccasionDTO): Promise<OccasionOutputDTO> {
    return this.occasionsService.create(dto);
  }

  @Get()
  findAll(): Promise<OccasionOutputDTO[]> {
    return this.occasionsService.findAll();
  }

  @Get(':id/stats')
  getStats(
    @Param('id', occasionIdPipe) id: string,
    @Query() query: OccasionStatsQueryDTO,
  ): Promise<OccasionStatsOutputDTO> {
    return this.occasionsService.getStats(id, query);
  }
}
