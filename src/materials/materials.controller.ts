import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDTO } from './dto/create-material.dto';
import { UpdateMaterialDTO } from './dto/update-material.dto';
import { FindMaterialsDTO } from './dto/find-materials.dto';
import { MaterialOutputDTO } from './dto/material-output.dto';

const materialIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException('id deve ser um uuid válido'),
});

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  create(@Body() dto: CreateMaterialDTO): Promise<MaterialOutputDTO> {
    return this.materialsService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindMaterialsDTO): Promise<MaterialOutputDTO[]> {
    return this.materialsService.findAll(query.type);
  }

  @Get(':id')
  findOne(@Param('id', materialIdPipe) id: string): Promise<MaterialOutputDTO> {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', materialIdPipe) id: string,
    @Body() dto: UpdateMaterialDTO,
  ): Promise<MaterialOutputDTO> {
    return this.materialsService.update(id, dto);
  }
}
