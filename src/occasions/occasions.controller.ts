import { Body, Controller, Get, Post } from '@nestjs/common';
import { OccasionsService } from './occasions.service';
import { CreateOccasionDTO } from './dto/create-occasion.dto';
import { OccasionOutputDTO } from './dto/occasion-output.dto';

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
}
