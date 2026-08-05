import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalsService } from './withdrawals.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WithdrawalsService', () => {
  let service: WithdrawalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WithdrawalsService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<WithdrawalsService>(WithdrawalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
