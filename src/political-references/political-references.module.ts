import { Module } from '@nestjs/common';
import { PoliticalReferencesController } from './political-references.controller';
import { PoliticalReferencesService } from './political-references.service';

@Module({
  controllers: [PoliticalReferencesController],
  providers: [PoliticalReferencesService],
})
export class PoliticalReferencesModule {}
