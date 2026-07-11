import { PlanPeriod, PlanType } from '@app/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class PlansListQuery extends PaginationSortingQuery {
  @ApiPropertyOptional({
    description: 'Search by plan code',
    example: 'daily',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class UpdatePlanRequestDto {
  @ApiPropertyOptional({
    description: 'Whether plan is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether plan is recommended',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @ApiPropertyOptional({
    description: 'Plan price',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  price?: number;
}

export class CreatePlanRequestDto {
  @ApiProperty({
    description: 'Plan code',
    example: '1-day',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Plan type',
    example: 'subscription',
    enum: PlanType,
  })
  @IsEnum(PlanType)
  type: PlanType;

  @ApiProperty({
    description: 'Plan period',
    example: 'day',
  })
  @IsOptional()
  @IsEnum(PlanPeriod)
  period?: PlanPeriod;

  @ApiProperty({
    description: 'Plan period count',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  periodCount?: number;

  @ApiProperty({
    description: 'Plan price',
    example: 1,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Whether plan is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Plan air bonus amount',
    example: 0,
  })
  @IsNumber()
  air: number;

  @ApiProperty({
    description: 'Whether plan is recommended',
    example: false,
  })
  @IsBoolean()
  isRecommended: boolean;
}
