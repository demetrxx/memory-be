import { AdminRole } from '@app/core';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface Admin {
  email: string;
  firstName: string;
  lastName: string;
  id: string;
  role: AdminRole;
}

export const Admin = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user as Admin;
  },
);
