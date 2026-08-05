import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDTO } from './dto/create-withdrawal.dto';
import { FindWithdrawalsDTO } from './dto/find-withdrawals.dto';
import { WithdrawalOutputDTO } from './dto/withdrawal-output.dto';

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
}
