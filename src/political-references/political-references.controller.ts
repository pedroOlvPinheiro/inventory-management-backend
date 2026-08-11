import { Body, Controller, Get, Post } from '@nestjs/common';
import { PoliticalReferencesService } from './political-references.service';
import { CreatePoliticalReferenceDTO } from './dto/create-political-reference.dto';
import { PoliticalReferenceOutputDTO } from './dto/political-reference-output.dto';

@Controller('political-references')
export class PoliticalReferencesController {
  constructor(
    private readonly politicalReferencesService: PoliticalReferencesService,
  ) {}

  @Post()
  create(
    @Body() dto: CreatePoliticalReferenceDTO,
  ): Promise<PoliticalReferenceOutputDTO> {
    return this.politicalReferencesService.create(dto);
  }

  @Get()
  findAll(): Promise<PoliticalReferenceOutputDTO[]> {
    return this.politicalReferencesService.findAll();
  }
}
