import { Controller, Get, Query } from '@nestjs/common';

import { ProtectedWeb } from '@/modules/auth';
import { SettlementService } from '@/modules/settlement';

import { GetSettlementsRequestDto, SettlementDto } from './dtos';

@ProtectedWeb(true)
@Controller()
export class SettlementsController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get()
  async getMany(@Query() query: GetSettlementsRequestDto) {
    const { data, total, skip, take } =
      await this.settlementService.findMany(query);

    return {
      data: data.map(SettlementDto.mapFromEntity),
      total,
      skip,
      take,
    };
  }
}
