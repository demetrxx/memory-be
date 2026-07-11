import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../common';

export enum SystemLogStatus {
  Success = 'success',
  Error = 'error',
}

@Entity('system_log')
export class SystemLogEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    name: 'message',
    nullable: true,
  })
  message: string;

  @Column({
    type: 'varchar',
    name: 'type',
  })
  type: string;

  @Column({
    type: 'varchar',
    name: 'level',
  })
  level: string;

  @Column({
    type: 'json',
    name: 'payload',
    nullable: true,
  })
  payload: any | null;

  @Column({
    type: 'text',
    name: 'stack_trace',
    nullable: true,
  })
  stackTrace: string | null;

  @Column({
    type: 'enum',
    enum: SystemLogStatus,
    name: 'status',
    enumName: 'system_log_status',
  })
  status: SystemLogStatus;
}
