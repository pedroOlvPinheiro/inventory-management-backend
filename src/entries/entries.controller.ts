import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { CreateEntryDTO } from './dto/create-entry.dto';
import { FindEntriesDTO } from './dto/find-entries.dto';
import { EntryOutputDTO } from './dto/entry-output.dto';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  create(@Body() dto: CreateEntryDTO): Promise<EntryOutputDTO> {
    return this.entriesService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindEntriesDTO): Promise<EntryOutputDTO[]> {
    return this.entriesService.findAll(query.materialId);
  }
}
