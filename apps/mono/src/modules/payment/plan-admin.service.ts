import { PlanEntity, PlanPeriod, PlanType } from '@app/core';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Brackets, DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

@Injectable()
export class PlanAdminService {
  private readonly logger = new Logger(PlanAdminService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getMany(query: PaginationSortingQuery & { search?: string }) {
    const { order, skip, take, search } = query;

    const plansRepo = this.dataSource.getRepository(PlanEntity);

    const qb = plansRepo
      .createQueryBuilder('plan')
      .select([
        'plan.id',
        'plan.code',
        'plan.type',
        'plan.period',
        'plan.periodCount',
        'plan.price',
        'plan.isRecommended',
        'plan.items',
        'plan.air',
        'plan.isActive',
        'plan.createdAt',
        'plan.updatedAt',
      ])
      .orderBy(`plan.createdAt`, order)
      .skip(skip)
      .take(take);

    if (search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('plan.code ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    const plans = await qb.getMany();
    const total = await qb.getCount();

    return {
      total,
      data: plans,
      skip,
      take,
    };
  }

  async create(dto: {
    period?: PlanPeriod;
    price: number;
    isActive: boolean;
    type: PlanType;
  }) {
    const plansRepo = this.dataSource.getRepository(PlanEntity);

    return plansRepo.save({
      period: dto.period,
      price: dto.price,
      isActive: dto.isActive,
      type: dto.type,
    });
  }

  async update(
    id: string,
    dto: {
      isActive?: boolean;
      isRecommended?: boolean;
      amountCents?: number;
    },
  ) {
    const plansRepo = this.dataSource.getRepository(PlanEntity);

    const plan = await plansRepo.findOne({
      where: { id },
    });

    if (!plan) {
      throw Err.notFound(`Plan with id ${id} not found`);
    }

    await plansRepo.update(id, {
      isActive: dto.isActive,
      amountCents: dto.amountCents,
    });
  }

  async delete(id: string) {
    const plansRepo = this.dataSource.getRepository(PlanEntity);

    const plan = await plansRepo.findOne({
      where: { id },
    });

    if (!plan) {
      throw Err.notFound(`Plan with id ${id} not found`);
    }

    await plansRepo.softDelete({ id });
  }
}
