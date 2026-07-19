import { SettlementEntity } from '@app/core';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PaginationSortingQuery } from '@/common/utils';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async findMany(
    q: PaginationSortingQuery & {
      search?: string;
    },
  ) {
    const repo = this.dataSource.getRepository(SettlementEntity);

    const query = repo
      .createQueryBuilder('settlement')
      .skip(q.skip)
      .take(q.take);

    if (q.search) {
      query.where('settlement.name ILIKE :search', { search: `%${q.search}%` });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      skip: q.skip,
      take: q.take,
    };
  }
}
