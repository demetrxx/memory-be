import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common';
import { UserEntity } from './user.entity';

export enum NotificationType {
  System = 'system',
  Promo = 'promo',
}

export interface NotificationPayload {
  [NotificationType.System]: {
    title: string;
    text: string;
  };
  [NotificationType.Promo]: {
    imgUrl: string;
    title: string;
    text: string;
    actionText: string;
  };
}

@Entity('notification')
export class NotificationEntity extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: NotificationType,
    enumName: 'notification_type',
  })
  type: NotificationType;

  @Column({
    type: 'json',
    default: {},
  })
  payload: NotificationPayload[NotificationType];

  @ManyToOne(() => UserEntity, (u) => u.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_notification_user')
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_read',
  })
  isRead: boolean;
}
