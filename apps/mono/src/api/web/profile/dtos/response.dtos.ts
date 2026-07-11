import {
  AuthProvider,
  PlanPeriod,
  SubscriptionEntity,
  UserEntity,
} from '@app/core';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionResponseDto {
  @ApiProperty({
    description: 'Subscription period',
    example: 'month',
  })
  period: PlanPeriod;

  @ApiProperty({
    description: 'Subscription end date',
    example: '2023-01-01T00:00:00.000Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Subscription recharge',
  })
  recharge: boolean;

  static mapFromEntity(entity: SubscriptionEntity): SubscriptionResponseDto {
    return {
      period: entity.period,
      endDate: entity.endDate,
      recharge: entity.recharge,
    };
  }
}

export class ProfileResponseDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User subscription',
    example: {
      period: 'month',
      endDate: '2023-01-01T00:00:00.000Z',
      recharge: true,
    },
  })
  subscription: SubscriptionResponseDto;

  @ApiProperty({
    description: 'Whether user should be notified by email',
    example: true,
  })
  notifyEmail: boolean;

  @ApiProperty({
    description: 'Connected OAuth providers',
    example: {
      google: true,
    },
  })
  authProviders: Record<AuthProvider, boolean>;

  @ApiProperty({
    description: 'User creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  static mapFromEntity(entity: UserEntity): ProfileResponseDto {
    return {
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      subscription: entity.subscription
        ? SubscriptionResponseDto.mapFromEntity(entity.subscription)
        : null,
      notifyEmail: entity.notifyEmail,
      authProviders: {
        [AuthProvider.Email]: Boolean(entity.passwordHash),
        [AuthProvider.Google]: Boolean(entity.googleSub),
      },
      createdAt: entity.createdAt,
    };
  }
}
