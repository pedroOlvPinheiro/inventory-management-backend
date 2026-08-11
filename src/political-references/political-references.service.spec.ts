import { Test, TestingModule } from '@nestjs/testing';
import { PoliticalReferencesService } from './political-references.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PoliticalReferencesService', () => {
  let service: PoliticalReferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliticalReferencesService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<PoliticalReferencesService>(
      PoliticalReferencesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
