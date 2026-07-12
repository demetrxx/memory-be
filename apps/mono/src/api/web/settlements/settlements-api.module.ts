import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { SettlementModule } from '@/modules/settlement';

import { SettlementsController } from './settlements.controller';

@Module({
  imports: [SettlementModule, AuthModule],
  controllers: [SettlementsController],
  providers: [],
})
export class SettlementsApiModule {}
