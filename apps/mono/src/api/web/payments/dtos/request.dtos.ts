import { PlanType } from '@app/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class PlansWebQuery {
  @ApiPropertyOptional({
    description: 'Plan type',
    example: 'subscription',
    enum: PlanType,
  })
  @IsOptional()
  @IsEnum(PlanType)
  type?: PlanType;
}
