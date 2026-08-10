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
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDTO } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalDTO } from './dto/update-withdrawal.dto';
import { FindWithdrawalsDTO } from './dto/find-withdrawals.dto';
import { WithdrawalOutputDTO } from './dto/withdrawal-output.dto';

const withdrawalIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException('id deve ser um uuid válido'),
});

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  create(@Body() dto: CreateWithdrawalDTO): Promise<WithdrawalOutputDTO> {
    return this.withdrawalsService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindWithdrawalsDTO): Promise<WithdrawalOutputDTO[]> {
    return this.withdrawalsService.findAll(query.materialId, query.occasionId);
  }

  @Patch(':id')
  update(
    @Param('id', withdrawalIdPipe) id: string,
    @Body() dto: UpdateWithdrawalDTO,
  ): Promise<WithdrawalOutputDTO> {
    return this.withdrawalsService.update(id, dto);
  }
}
