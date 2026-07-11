import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Err } from '@/common/errors/app-error';
import { getUserSubscription } from '@/modules/user';

import { AuthWebService } from '../auth-web.service';
import { UN_PROTECT_KEY, UserWeb } from '../decorators';
import { AuthenticatedUserWebFastifyRequest } from '../types';

@Injectable()
export class AuthWebGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthWebService,
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

    const isAnonymous = this.reflector.getAllAndOverride<boolean>(
      'isAnonymous',
      [context.getHandler(), context.getClass()],
    );

    const type = context.getType();

    if (type === 'http') {
      return this.handleHttp(context, isAnonymous);
    }

    return false;
  }

  private async handleHttp(context: ExecutionContext, isAnonymous?: boolean) {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedUserWebFastifyRequest>();
    const [type, token] = request.headers.authorization
      ? request.headers.authorization.split(' ')
      : [];
    const bearerToken = type === 'Bearer' ? token : null;

    if (!bearerToken) {
      throw new UnauthorizedException();
    }

    const user = await this.authService.authenticateAuthorizationHeader(
      request.headers.authorization,
    );

    if (!isAnonymous && user.isAnonymous) {
      throw Err.forbidden('Anonymous user not allowed', {
        action: 'REGISTER',
      });
    }

    request.token = bearerToken;
    request.user = {
      ...user,
      ...getUserSubscription(user.subscription),
    } as UserWeb;

    return true;
  }
}
