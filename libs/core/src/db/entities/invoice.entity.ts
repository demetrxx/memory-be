import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { PlanEntity } from './plan.entity';
import { UserEntity } from './user.entity';

export enum InvoiceStatus {
  Pending = 'pending',
  Paid = 'paid',
  Failed = 'failed',
}

@Entity('invoice')
export class InvoiceEntity extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.Pending,
  })
  status: InvoiceStatus;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({
    name: 'plan_id',
    referencedColumnName: 'id',
  })
  plan: PlanEntity;

  @Column({
    type: 'integer',
    name: 'amount_cents',
  })
  amountCents: number;

  @Index('idx_invoice__plan')
  @Column({
    type: 'uuid',
    name: 'plan_id',
  })
  planId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_invoice__user')
  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: true,
  })
  userId: string | null;
}
