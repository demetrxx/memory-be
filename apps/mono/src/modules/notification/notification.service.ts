import {
  NotificationEntity,
  NotificationPayload,
  NotificationType,
} from '@app/core';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PaginationSortingQuery } from '@/common/utils';

@Injectable()
export class NotificationService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getMany(userId: string, query: PaginationSortingQuery) {
    const { order, skip, take } = query;

    const notificationRepository =
      this.dataSource.getRepository(NotificationEntity);

    const qb = notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', order)
      .skip(skip)
      .take(take);

    const [data, total] = await qb.getManyAndCount();

    if (total === 0) {
      // seed
      return this.getMany(userId, query);
    }

    return {
      total,
      data,
      skip,
      take,
    };
  }

  async sendOne<T extends NotificationType>(
    userId: string,
    type: T,
    payload?: NotificationPayload[T],
  ) {
    await this.dataSource.getRepository(NotificationEntity).save({
      userId,
      type,
      payload,
    });
  }

  async readAll(userId: string) {
    await this.dataSource
      .getRepository(NotificationEntity)
      .update({ userId }, { isRead: true });
  }
}
