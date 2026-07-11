import { Column, Entity, Index } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';

export enum PlanPeriod {
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year',
}

export enum PlanType {
  Subscription = 'subscription',
  Service = 'service',
}

@Index('idx_plan_period_is_active', ['period', 'isActive'], {
  where: 'is_active = true AND period IS NOT NULL',
  unique: true,
})
@Entity('plan')
export class PlanEntity extends AbstractEntity {
  @Column({
    enum: PlanType,
    name: 'type',
    type: 'enum',
    enumName: 'plan_type',
  })
  type: PlanType;

  @Column({
    enum: PlanPeriod,
    enumName: 'plan_period',
    nullable: true,
    name: 'period',
    type: 'enum',
  })
  period: PlanPeriod;

  @Column({
    type: 'integer',
    name: 'amount_cents',
  })
  amountCents: number;

  @Column({
    type: 'integer',
    name: 'monthly_price_cents',
    nullable: true,
  })
  monthlyPriceCents: number;

  @Column({
    type: 'integer',
    name: 'discount',
    nullable: true,
  })
  discount: number;

  @Column({
    type: 'boolean',
    name: 'is_active',
  })
  isActive: boolean;
}
