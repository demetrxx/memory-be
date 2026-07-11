import { SubscriptionEntity, UserEntity } from '@app/core';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';

@Injectable()
export class UserWebService {
  private readonly logger = new Logger(UserWebService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async updateSubscription(id: string, dto: { recharge?: boolean }) {
    const subscriptionRepository =
      this.dataSource.getRepository(SubscriptionEntity);

    const subscription = await subscriptionRepository.findOne({
      where: { userId: id },
    });

    if (!subscription) {
      throw Err.notFound('Subscription not found');
    }

    await subscriptionRepository.update(subscription.id, {
      recharge: dto.recharge,
    });
  }

  async getOne(id: string) {
    const userRepo = this.dataSource.getRepository(UserEntity);
    return userRepo.findOne({
      where: { id },
      relations: ['subscription'],
    });
  }

  async updateOne(
    id: string,
    dto: { username?: string; notifyEmail?: boolean },
  ) {
    const userWebRepository = this.dataSource.getRepository(UserEntity);
    await userWebRepository.update(id, dto);
  }
}
