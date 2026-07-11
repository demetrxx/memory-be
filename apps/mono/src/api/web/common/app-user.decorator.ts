import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { type AppAuthenticatedFastifyRequest } from './types';

export const AppUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<AppAuthenticatedFastifyRequest>();

    return request.appUser;
  },
);
