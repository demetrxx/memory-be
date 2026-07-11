import { AdminRole } from '@app/core';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthAdminGuard } from '../guards';

export function ProtectedAdmin(roles?: AdminRole[]) {
  const guards: any[] = [AuthAdminGuard];

  const decorators = [UseGuards(...guards), ApiBearerAuth()];

  if (roles) {
    decorators.push(SetMetadata('roles', roles));
  }

  return applyDecorators(...decorators);
}
