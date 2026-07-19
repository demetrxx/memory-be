import { SettlementEntity, SettlementType } from '@app/core';
import { Controller, Get, Query } from '@nestjs/common';

import { ProtectedWeb } from '@/modules/auth';
import { SettlementService } from '@/modules/settlement';

import { GetSettlementsRequestDto, SettlementDto } from './dtos';

function sortSettlements(settlements: SettlementEntity[]) {
  // cities first
  // settlements second
  // villages third
  return settlements.sort((a, b) => {
    if (a.type === SettlementType.CITY) {
      return -1;
    }
    if (b.type === SettlementType.CITY) {
      return 1;
    }
    return 0;
  });
}

@ProtectedWeb(true)
@Controller()
export class SettlementsController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get()
  async getMany(@Query() query: GetSettlementsRequestDto) {
    const { data, total, skip, take } =
      await this.settlementService.findMany(query);

    return {
      data: sortSettlements(data).map(SettlementDto.mapFromEntity),
      total,
      skip,
      take,
    };
  }
}
