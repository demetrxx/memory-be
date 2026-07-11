import { ActivityLogEntity, ActivityLogType, SystemLogEntity } from '@app/core';
import { ApiProperty } from '@nestjs/swagger';

export class SystemLogDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'info' })
  type: string;

  @ApiProperty({ example: 'System log message' })
  message: string;

  @ApiProperty({ example: 'System log payload' })
  payload: unknown;

  @ApiProperty({ example: 'info' })
  level: string;

  @ApiProperty({ example: 'System log stack trace' })
  stackTrace: string;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  static mapFromEntity(entity: SystemLogEntity): SystemLogDto {
    return {
      id: entity.id,
      type: entity.type,
      message: entity.message,
      payload: entity.payload,
      level: entity.level,
      stackTrace: entity.stackTrace,
      status: entity.status,

      createdAt: entity.createdAt,
    };
  }
}

export class ActivityLogDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'info' })
  type: ActivityLogType;

  @ApiProperty({ example: 'user-123' })
  userId: string;

  @ApiProperty({ example: 'Activity log payload' })
  payload: unknown;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  static mapFromEntity(entity: ActivityLogEntity): ActivityLogDto {
    return {
      id: entity.id,
      type: entity.type,
      payload: entity.payload,
      userId: entity.userId,
      createdAt: entity.createdAt,
    };
  }
}
