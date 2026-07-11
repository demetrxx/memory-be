import { ActivityLogType } from '@app/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class SystemLogListQuery extends PaginationSortingQuery {
  @ApiPropertyOptional({
    description: 'Start datetime (UTC ISO)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({
    description: 'End datetime (UTC ISO)',
    example: '2026-02-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endAt?: string;
}

export class ActivityLogListQuery extends PaginationSortingQuery {
  @ApiPropertyOptional({
    description: 'Start datetime (UTC ISO)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({
    description: 'End datetime (UTC ISO)',
    example: '2026-02-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({
    description: 'Activity log type',
    example: ActivityLogType.Signup,
  })
  @IsOptional()
  @IsEnum(ActivityLogType)
  type?: ActivityLogType;

  @ApiPropertyOptional({
    description: 'Activity log user id',
    example: '00000000-0000-0000-0000-000000000000',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
