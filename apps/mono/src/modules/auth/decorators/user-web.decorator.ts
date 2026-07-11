import { UserEntity } from '@app/core';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserSubscription } from '@/modules/user';

export type UserWeb = UserEntity & UserSubscription;

export const UserWeb = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user as UserWeb;
  },
);
