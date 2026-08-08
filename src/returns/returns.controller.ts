import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDTO } from './dto/create-return.dto';
import { FindReturnsDTO } from './dto/find-returns.dto';
import { ReturnOutputDTO } from './dto/return-output.dto';
import { ReturnListItemDTO } from './dto/return-list-item.dto';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  create(@Body() dto: CreateReturnDTO): Promise<ReturnOutputDTO> {
    return this.returnsService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindReturnsDTO): Promise<ReturnListItemDTO[]> {
    return this.returnsService.findAll(query.materialId, query.occasionId);
  }
}
