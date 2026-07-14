import { MilitaryUnitEntity } from '@app/core';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Brackets, DataSource } from 'typeorm';

import { PaginationSortingQuery } from '@/common/utils';

import { militaryUnits } from './data';

@Injectable()
export class MilitaryUnitService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async findMany(
    q: PaginationSortingQuery & {
      search?: string;
    },
  ) {
    await this.seed();

    const repo = this.dataSource.getRepository(MilitaryUnitEntity);

    const query = repo.createQueryBuilder('mu').skip(q.skip).take(q.take);

    if (q.search) {
      // in brackets
      const searchObj = {
        search: `%${q.search}%`,
      };

      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            `EXISTS (
              SELECT 1
              FROM jsonb_array_elements(mu.names) AS unit_name
              WHERE unit_name ->> 'value' ILIKE :search
            )`,
            searchObj,
          );
          qb.orWhere('mu.number::text ILIKE :search', searchObj);
          qb.orWhere('mu.echelon::text ILIKE :search', searchObj);
          qb.orWhere('mu.specialization::text ILIKE :search', searchObj);
          qb.orWhere('mu.branch::text ILIKE :search', searchObj);
        }),
      );
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      skip: q.skip,
      take: q.take,
    };
  }

  async seed() {
    const repo = this.dataSource.getRepository(MilitaryUnitEntity);

    const mus = await repo.count();

    if (mus > 0) {
      return;
    }

    await repo.save(militaryUnits);
  }
}
