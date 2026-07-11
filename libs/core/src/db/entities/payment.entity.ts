import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { InvoiceEntity } from './invoice.entity';
import { PlanEntity } from './plan.entity';
import { UserEntity } from './user.entity';

@Entity('payment')
export class PaymentEntity extends AbstractEntity {
  @ManyToOne(() => UserEntity, (user) => user.payments)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index()
  @Column({
    type: 'varchar',
    length: 255,
  })
  userId: string;

  @OneToOne(() => InvoiceEntity)
  @JoinColumn({
    name: 'invoice_id',
    referencedColumnName: 'id',
  })
  invoice: InvoiceEntity;

  @Column({
    type: 'uuid',
    name: 'invoice_id',
  })
  invoiceId: string;

  @Column({
    type: 'integer',
  })
  amountCents: number;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({
    name: 'plan_id',
    referencedColumnName: 'id',
  })
  plan: PlanEntity;

  @Index('idx_payment_plan')
  @Column({
    type: 'uuid',
    name: 'plan_id',
  })
  planId: string;
}
