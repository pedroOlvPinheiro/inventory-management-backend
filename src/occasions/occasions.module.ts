import { Module } from '@nestjs/common';
import { OccasionsController } from './occasions.controller';
import { OccasionsService } from './occasions.service';

@Module({
  controllers: [OccasionsController],
  providers: [OccasionsService],
})
export class OccasionsModule {}
