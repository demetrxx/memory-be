import { Controller, Get, Query } from '@nestjs/common';

import { ProtectedWeb } from '@/modules/auth';
import { MilitaryUnitService } from '@/modules/military-unit';

import { GetMilitaryUnitsRequestDto, MilitaryUnitDto } from './dtos';

@ProtectedWeb(true)
@Controller()
export class MilitaryUnitsController {
  constructor(private readonly militaryUnitService: MilitaryUnitService) {}

  @Get()
  async getMany(@Query() query: GetMilitaryUnitsRequestDto) {
    const { data, total, skip, take } =
      await this.militaryUnitService.findMany(query);

    return {
      data: data.map(MilitaryUnitDto.mapFromEntity),
      total,
      skip,
      take,
    };
  }
}
