import {
  NotificationEntity,
  NotificationPayload,
  NotificationType,
  PlanPeriod,
  UserEntity,
} from '@app/core';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface NotificationUserFilters {
  lastActivityBefore?: Date;
  lastActivityAfter?: Date;
  subscribed?: boolean;
  planPeriods?: PlanPeriod[];
  userIds?: string[];
}

@Injectable()
export class NotificationAdminService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async initSend(
    filters: NotificationUserFilters,
    d: {
      type: NotificationType;
      payload: NotificationPayload[NotificationType];
    },
  ) {
    const {
      lastActivityBefore,
      lastActivityAfter,
      subscribed,
      planPeriods,
      userIds,
    } = filters;

    const userRepo = this.dataSource.getRepository(UserEntity);

    const qb = userRepo
      .createQueryBuilder('user')
      .select(['user.id', 'user.lastActivityAt', 'user.createdAt'])
      .where('user.isActive = true');

    if (lastActivityBefore) {
      qb.andWhere('user.lastActivityAt < :lastActivityBefore', {
        lastActivityBefore,
      });
    }

    if (lastActivityAfter) {
      qb.andWhere('user.lastActivityAt > :lastActivityAfter', {
        lastActivityAfter,
      });
    }

    if (subscribed) {
      qb.leftJoinAndSelect('user.subscription', 'subscription').andWhere(
        'subscription.endDate > :now',
        {
          now: new Date(),
        },
      );
    }

    if (planPeriods) {
      qb.andWhere('subscription.period IN (:...planPeriods)', {
        planPeriods,
      });
    }

    if (userIds) {
      qb.andWhere('user.id IN (:...userIds)', {
        userIds,
      });
    }

    const users = await qb.getMany();

    await this.sendMany(
      users.map((user) => user.id),
      d.type,
      d.payload,
    );
  }

  private async sendMany<T extends NotificationType>(
    userIds: string[],
    type: T,
    payload?: NotificationPayload[T],
  ) {
    const notifications = userIds.map((userId) => ({
      userId,
      type,
      payload,
    }));

    await this.dataSource.getRepository(NotificationEntity).save(notifications);
  }
}
