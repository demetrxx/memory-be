import { PlanEntity, PlanType } from '@app/core';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PlanWebService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getActive(query: { type?: PlanType }) {
    const { type } = query;

    const planRepository = this.dataSource.getRepository(PlanEntity);

    const plans = await planRepository.find({
      where: {
        isActive: true,
        type,
      },
    });

    // if (plans.length === 0 && type) {
    //   switch (type) {
    //     case PlanType.Subscription:
    //       plans = await this.seedSubscription();
    //       break;
    //     case PlanType.Service:
    //       plans = await this.seedCredits();
    //       break;
    //   }
    // }

    return plans;
  }

  seedSubscription() {
    const plans = [];

    const planRepository = this.dataSource.getRepository(PlanEntity);
    return planRepository.save(plans);
  }
}
