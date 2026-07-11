import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthWebGuard } from '../guards';

export function ProtectedWeb(isAnonymous?: boolean) {
  const guards: any[] = [AuthWebGuard];

  const decorators = [UseGuards(...guards), ApiBearerAuth()];

  if (isAnonymous) {
    decorators.push(SetMetadata('isAnonymous', true));
  }

  return applyDecorators(...decorators);
}
