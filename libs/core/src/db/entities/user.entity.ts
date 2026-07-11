import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { NotificationEntity } from './notification.entity';
import { PaymentEntity } from './payment.entity';
import { RefreshWebSessionEntity } from './refresh-web-session.entity';
import { SubscriptionEntity } from './subscription.entity';

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Blocked = 'blocked',
}

export enum AuthProvider {
  Email = 'email',
  Google = 'google',
}

export interface AnonymousUserData {}

@Entity('user')
export class UserEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  firstName: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  lastName: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  username: string | null;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_anonymous',
  })
  isAnonymous: boolean;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.Active,
  })
  status: UserStatus;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  email: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string | null;

  @Index('idx_user_google_sub', {
    unique: true,
    where: '"google_sub" IS NOT NULL',
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'google_sub',
  })
  googleSub: string | null;

  @Column({
    type: 'timestamp',
    name: 'last_activity_at',
    default: () => 'NOW()',
  })
  lastActivityAt: Date;

  @Column({
    type: 'json',
    name: 'anonymous_data',
    nullable: true,
  })
  anonymousData: AnonymousUserData | null;

  // preferences
  @Column({
    type: 'boolean',
    default: true,
    name: 'notify_email',
  })
  notifyEmail: boolean;

  @OneToOne(() => SubscriptionEntity, (subscription) => subscription.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  subscription: SubscriptionEntity | null;

  @OneToMany(() => RefreshWebSessionEntity, (session) => session.user)
  refreshSessions: RefreshWebSessionEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications: NotificationEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.user)
  payments: PaymentEntity[];
}
