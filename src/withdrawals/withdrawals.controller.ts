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
import { CreateWithdrawalBatchDTO } from './dto/create-withdrawal-batch.dto';
import { UpdateWithdrawalDTO } from './dto/update-withdrawal.dto';
import { FindWithdrawalsDTO } from './dto/find-withdrawals.dto';
import { WithdrawalOutputDTO } from './dto/withdrawal-output.dto';
import { WithdrawalBatchOutputDTO } from './dto/withdrawal-batch-output.dto';

const withdrawalIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException('id deve ser um uuid válido'),
});

const withdrawalGroupIdPipe = new ParseUUIDPipe({
  exceptionFactory: () =>
    new BadRequestException('groupId deve ser um uuid válido'),
});

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  create(@Body() dto: CreateWithdrawalDTO): Promise<WithdrawalOutputDTO> {
    return this.withdrawalsService.create(dto);
  }

  @Post('batch')
  createBatch(
    @Body() dto: CreateWithdrawalBatchDTO,
  ): Promise<WithdrawalBatchOutputDTO> {
    return this.withdrawalsService.createBatch(dto);
  }

  @Get()
  findAll(@Query() query: FindWithdrawalsDTO): Promise<WithdrawalOutputDTO[]> {
    return this.withdrawalsService.findAll(query.materialId, query.occasionId);
  }

  @Get('batch/:groupId')
  findBatch(
    @Param('groupId', withdrawalGroupIdPipe) groupId: string,
  ): Promise<WithdrawalBatchOutputDTO> {
    return this.withdrawalsService.findBatch(groupId);
  }

  @Patch(':id')
  update(
    @Param('id', withdrawalIdPipe) id: string,
    @Body() dto: UpdateWithdrawalDTO,
  ): Promise<WithdrawalOutputDTO> {
    return this.withdrawalsService.update(id, dto);
  }
}
