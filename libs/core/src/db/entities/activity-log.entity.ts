import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { UserEntity } from './user.entity';

export enum ActivityLogType {
  // auth
  Open = 'open',
  Signup = 'signup',
  UpdateProfile = 'update_profile',

  // memory
  CreateMemory = 'create_memory',
  EditMemory = 'edit_memory',
  DeleteMemory = 'delete_memory',

  // deceased
  CreateDeceased = 'create_deceased',
  EditDeceased = 'edit_deceased',
  DeleteDeceased = 'delete_deceased',

  // products
  AddProduct = 'add_product',

  // invoices
  CreateInvoice = 'create_invoice',
  PayInvoice = 'pay_invoice',
}

@Entity('activity_log')
export class ActivityLogEntity extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: ActivityLogType,
    enumName: 'activity_log_type',
  })
  type: ActivityLogType;

  @Column({
    type: 'jsonb',
    name: 'payload',
    nullable: true,
  })
  payload: any | null;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_log_user_id')
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;
}
