import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MaterialsModule } from './materials/materials.module';
import { OccasionsModule } from './occasions/occasions.module';
import { EntriesModule } from './entries/entries.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { KitsModule } from './kits/kits.module';
import { ReturnsModule } from './returns/returns.module';

@Module({
  imports: [
    PrismaModule,
    MaterialsModule,
    OccasionsModule,
    EntriesModule,
    WithdrawalsModule,
    KitsModule,
    ReturnsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
