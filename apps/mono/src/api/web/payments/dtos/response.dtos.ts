import { PlanEntity, PlanPeriod, PlanType } from '@app/core';
import { ApiProperty } from '@nestjs/swagger';

export class PlanWebDto {
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
    example: 'month',
  })
  period: PlanPeriod;

  @ApiProperty({
    description: 'Plan monthly price',
    example: 100,
  })
  monthlyPrice: number;

  @ApiProperty({
    description: 'Plan discount',
    example: 10,
  })
  discount: number;

  @ApiProperty({
    description: 'Plan total price',
    example: 100,
  })
  price: number;

  static mapFromEntity(entity: PlanEntity): PlanWebDto {
    return {
      id: entity.id,
      type: entity.type,
      period: entity.period,
      monthlyPrice: entity.monthlyPriceCents / 100,
      price: entity.amountCents / 100,
      discount: entity.discount,
    };
  }
}
