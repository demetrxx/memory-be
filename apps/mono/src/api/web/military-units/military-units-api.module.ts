import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { MilitaryUnitModule } from '@/modules/military-unit';

import { MilitaryUnitsController } from './military-units.controller';

@Module({
  imports: [MilitaryUnitModule, AuthModule],
  controllers: [MilitaryUnitsController],
  providers: [],
})
export class MilitaryUnitsApiModule {}
