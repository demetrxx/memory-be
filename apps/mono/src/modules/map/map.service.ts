import { Region, SettlementEntity, SettlementType } from '@app/core';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import {
  getWeightFromCounts,
  IRegionMapData,
  mockRegionMapData,
  RegionCounts,
} from './mock';

function getValue(value: number, idx: number) {
  return Math.round(value / 10 + (value / 100) * idx);
}

@Injectable()
export class MapService {
  constructor(
    @InjectDataSource()
    private readonly ds: DataSource,
  ) {}

  async getMapData(): Promise<IRegionMapData> {
    return mockRegionMapData;
  }

  // return {
  //     settlements: [],
  //     settlementsData: {},
  //   };
  async getRegionMapData(region: Region) {
    const settlements = await this.ds.getRepository(SettlementEntity).find({
      where: {
        region: region,
        type: SettlementType.CITY,
      },
      take: 10,
    });

    const counts = RegionCounts[region];

    return {
      settlements,
      settlementsData: settlements.reduce((acc, settlement, idx) => {
        acc[settlement.id] = {
          counts: {
            deceased: getValue(counts[0], idx),
            items: getValue(counts[1], idx),
            memories: getValue(counts[2], idx),
          },
          weight: getWeightFromCounts(
            getValue(counts[0], idx),
            getValue(counts[1], idx),
            getValue(counts[2], idx),
          ),
        };
        return acc;
      }, {}),
    };
  }
}
