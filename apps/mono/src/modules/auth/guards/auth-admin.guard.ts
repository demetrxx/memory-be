import { AdminRole } from '@app/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthAdminService } from '../auth-admin.service';
import { UN_PROTECT_KEY } from '../decorators';
import { AuthenticatedAdminFastifyRequest } from '../types';

@Injectable()
export class AuthAdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthAdminService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isUnProtectedDecoratorSpecified =
      this.reflector.getAllAndOverride<boolean>(UN_PROTECT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (isUnProtectedDecoratorSpecified) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    const type = context.getType();

    if (type === 'http') {
      return this.handleHttp(context, requiredRoles);
    }

    return false;
  }

  private async handleHttp(context: ExecutionContext, roles: AdminRole[]) {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedAdminFastifyRequest>();
    const [type, token] = request.headers.authorization
      ? request.headers.authorization.split(' ')
      : [];
    const bearerToken = type === 'Bearer' ? token : null;

    if (!bearerToken) {
      throw new UnauthorizedException();
    }
    const user = await this.authService.authenticateAuthorizationHeader(
      request.headers.authorization,
      roles,
    );

    request.token = bearerToken;
    request.user = user;

    return true;
  }
}
