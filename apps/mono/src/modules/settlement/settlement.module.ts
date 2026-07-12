import { Module } from '@nestjs/common';

import { SettlementService } from './settlement.service';

@Module({
  imports: [],
  providers: [SettlementService],
  exports: [SettlementService],
})
export class SettlementModule {}
