import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { PlanPeriod } from './plan.entity';
import { UserEntity } from './user.entity';

@Entity('subscription')
export class SubscriptionEntity extends AbstractEntity {
  @Column({
    enum: PlanPeriod,
    name: 'period',
    enumName: 'plan_period',
    type: 'enum',
  })
  period: PlanPeriod;

  @Column({
    type: 'timestamp',
    name: 'end_date',
  })
  endDate: Date;

  @OneToOne(() => UserEntity, (user) => user.subscription, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'boolean',
    name: 'recharge',
    default: true,
  })
  recharge: boolean;
}
