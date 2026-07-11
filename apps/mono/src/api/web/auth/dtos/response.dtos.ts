import { PlanPeriod, UserStatus } from '@app/core';
import { ApiProperty } from '@nestjs/swagger';

import { UserWeb } from '@/modules/auth';

export class UserWebDto {
  @ApiProperty({
    description: 'Admin identifier',
    example: 'admin-123',
  })
  id: string;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;

  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
  })
  email: string | null;

  @ApiProperty({
    description: 'Whether user is anonymous',
    example: false,
  })
  isAnonymous: boolean;

  @ApiProperty({
    description: 'Admin status',
    example: 'active',
  })
  status: UserStatus;

  @ApiProperty({
    description: 'Whether user is subscribed',
    example: true,
  })
  isSubscribed: boolean;

  @ApiProperty({
    description: 'User subscription period',
    example: PlanPeriod.Month,
  })
  subscriptionPeriod: PlanPeriod;

  static mapFromEntity(e: UserWeb): UserWebDto {
    return {
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      status: e.status,
      email: e.email,
      isAnonymous: e.isAnonymous,
      isSubscribed: e.isSubscribed,
      subscriptionPeriod: e.subscriptionPeriod,
    };
  }
}
