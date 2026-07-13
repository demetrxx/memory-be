import { Module } from '@nestjs/common';

import { MilitaryUnitService } from './military-unit.service';

@Module({
  imports: [],
  providers: [MilitaryUnitService],
  exports: [MilitaryUnitService],
})
export class MilitaryUnitModule {}
