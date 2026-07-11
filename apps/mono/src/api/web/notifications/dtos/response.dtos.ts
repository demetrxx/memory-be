import {
  NotificationEntity,
  NotificationPayload,
  NotificationType,
} from '@app/core';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'The ID of the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The type of the notification',
    example: 'ping',
  })
  type: NotificationType;

  @ApiProperty({
    description: 'The payload of the notification',
    example: {
      message: 'Hello, how are you?',
    },
  })
  payload: NotificationPayload[NotificationType];

  @ApiProperty({
    description: 'The created at date of the notification',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Whether the notification is read',
    example: true,
  })
  isRead: boolean;

  static mapFromEntity(entity: NotificationEntity): NotificationResponseDto {
    return {
      id: entity.id,
      type: entity.type,
      payload: entity.payload,
      createdAt: entity.createdAt,
      isRead: entity.isRead,
    };
  }
}
