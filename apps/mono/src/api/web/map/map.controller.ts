import { Controller, Get, Param } from '@nestjs/common';

import { ProtectedWeb } from '@/modules/auth';
import { MapService } from '@/modules/map';

import { RegionParamsDto } from './dto';

@ProtectedWeb(true)
@Controller()
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  get() {
    return this.mapService.getMapData();
  }

  @Get(':region')
  getByRegion(@Param() params: RegionParamsDto) {
    return this.mapService.getRegionMapData(params.region);
  }
}
