import { ActivityLogEntity, SystemLogEntity, SystemLogStatus } from '@app/core';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PaginationSortingQuery } from '@/common/utils';

@Injectable()
export class LogsAdminService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getSystemLogs(
    query: PaginationSortingQuery & {
      type?: string;
      status?: SystemLogStatus;
      startAt?: string;
      endAt?: string;
    },
  ) {
    const repository = this.dataSource.getRepository(SystemLogEntity);
    const qb = repository.createQueryBuilder('log');

    if (query.startAt) {
      qb.andWhere('log.createdAt >= :startAt', {
        startAt: new Date(query.startAt),
      });
    }

    if (query.endAt) {
      qb.andWhere('log.createdAt < :endAt', {
        endAt: new Date(query.endAt),
      });
    }

    if (query.type) {
      qb.andWhere('log.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('log.status = :status', { status: query.status });
    }

    qb.orderBy(`log.${query.orderBy}`, query.order)
      .skip(query.skip)
      .take(query.take);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, skip: query.skip, take: query.take };
  }

  async getActivityLogs(
    query: PaginationSortingQuery & {
      startAt?: string;
      endAt?: string;
      userId?: string;
    },
  ) {
    const repository = this.dataSource.getRepository(ActivityLogEntity);
    const qb = repository.createQueryBuilder('log');

    if (query.startAt) {
      qb.andWhere('log.createdAt >= :startAt', {
        startAt: new Date(query.startAt),
      });
    }

    if (query.endAt) {
      qb.andWhere('log.createdAt < :endAt', {
        endAt: new Date(query.endAt),
      });
    }

    if (query.userId) {
      qb.andWhere('log.userId = :userId', { userId: query.userId });
    }

    qb.orderBy(`log.${query.orderBy}`, query.order)
      .skip(query.skip)
      .take(query.take);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, skip: query.skip, take: query.take };
  }
}
