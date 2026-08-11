import { Body, Controller, Get, Post } from '@nestjs/common';
import { PeopleService } from './people.service';
import { CreatePersonDTO } from './dto/create-person.dto';
import { PersonOutputDTO } from './dto/person-output.dto';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Post()
  create(@Body() dto: CreatePersonDTO): Promise<PersonOutputDTO> {
    return this.peopleService.create(dto);
  }

  @Get()
  findAll(): Promise<PersonOutputDTO[]> {
    return this.peopleService.findAll();
  }
}
