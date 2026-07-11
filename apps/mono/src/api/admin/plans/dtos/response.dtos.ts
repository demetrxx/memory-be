import { PlanEntity, PlanPeriod, PlanType } from '@app/core';
import { ApiProperty } from '@nestjs/swagger';

export class PlanDto {
  @ApiProperty({
    description: 'Plan identifier',
    example: 'plan-123',
  })
  id: string;

  @ApiProperty({
    description: 'Plan type',
    example: 'subscription',
  })
  type: PlanType;

  @ApiProperty({
    description: 'Plan period',
    example: 'day',
  })
  period: PlanPeriod;

  @ApiProperty({
    description: 'Whether plan is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Plan price',
    example: 1,
  })
  amountCents: number;

  @ApiProperty({
    description: 'Plan creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Plan last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  static mapFromEntity(entity: PlanEntity): PlanDto {
    return {
      id: entity.id,
      type: entity.type,
      period: entity.period,
      amountCents: entity.amountCents,
      isActive: entity.isActive,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }
}
