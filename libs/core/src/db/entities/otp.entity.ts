import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common';
import { UserEntity } from './user.entity';

export enum OtpPurpose {
  VerifyEmail = 'verify_email',
  ResetPassword = 'reset_password',
}

export interface OtpPayload {
  email: string;
}

@Index('idx_otp_user_purpose_id', ['userId', 'code', 'purpose'], {
  unique: true,
})
@Entity('otp')
export class OtpEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({
    type: 'enum',
    enum: OtpPurpose,
    enumName: 'otp_purpose',
    name: 'purpose',
  })
  purpose: OtpPurpose;

  @Column({
    type: 'timestamp',
    name: 'expires_at',
  })
  expiresAt: Date;

  @Column({
    type: 'timestamp',
    name: 'activated_at',
    nullable: true,
  })
  activatedAt: Date | null;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_otp_user_id')
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'jsonb',
    name: 'payload',
  })
  payload: OtpPayload;
}
