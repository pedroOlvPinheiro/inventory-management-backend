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
import { EntriesService } from './entries.service';
import { CreateEntryDTO } from './dto/create-entry.dto';
import { UpdateEntryDTO } from './dto/update-entry.dto';
import { FindEntriesDTO } from './dto/find-entries.dto';
import { EntryOutputDTO } from './dto/entry-output.dto';

const entryIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException('id deve ser um uuid válido'),
});

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

  @Patch(':id')
  update(
    @Param('id', entryIdPipe) id: string,
    @Body() dto: UpdateEntryDTO,
  ): Promise<EntryOutputDTO> {
    return this.entriesService.update(id, dto);
  }
}
