import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { MapModule } from '@/modules/map';

import { MapController } from './map.controller';

@Module({
  imports: [AuthModule, MapModule],
  controllers: [MapController],
})
export class MapApiModule {}
