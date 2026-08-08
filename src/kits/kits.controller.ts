import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { KitsService } from './kits.service';
import { CreateKitDTO } from './dto/create-kit.dto';
import { AssembleKitDTO } from './dto/assemble-kit.dto';
import { KitOutputDTO } from './dto/kit-output.dto';

const kitIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException('id deve ser um uuid válido'),
});

@Controller('kits')
export class KitsController {
  constructor(private readonly kitsService: KitsService) {}

  @Post()
  create(@Body() dto: CreateKitDTO): Promise<KitOutputDTO> {
    return this.kitsService.create(dto);
  }

  @Get()
  findAll(): Promise<KitOutputDTO[]> {
    return this.kitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', kitIdPipe) id: string): Promise<KitOutputDTO> {
    return this.kitsService.findOne(id);
  }

  @Post(':id/assemble')
  assemble(
    @Param('id', kitIdPipe) id: string,
    @Body() dto: AssembleKitDTO,
  ): Promise<KitOutputDTO> {
    return this.kitsService.assemble(id, dto);
  }
}
