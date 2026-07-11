import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { Admin, AuthAdminService, ProtectedAdmin } from '@/modules/auth';

import {
  ChangePasswordRequestDto,
  EmailExistsRequestDto,
  SignInRequestDto,
} from './dtos';

@Controller('/')
export class AuthController {
  constructor(private readonly authService: AuthAdminService) {}

  @Post('/login')
  async signIn(
    @Body() body: SignInRequestDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this.authService.signIn(body, {
      ip: request.ip,
      userAgent: this.getUserAgent(request),
    });
    this.setRefreshCookie(reply, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('/refresh')
  async refreshToken(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const refreshToken = this.extractRefreshCookie(request);
    const tokens = await this.authService.refreshToken(refreshToken, {
      ip: request.ip,
      userAgent: this.getUserAgent(request),
    });
    if (tokens.refreshToken) {
      this.setRefreshCookie(reply, tokens.refreshToken);
    }
    return { accessToken: tokens.accessToken };
  }

  @Post('/change-password')
  @ProtectedAdmin()
  async changePassword(
    @Body() body: ChangePasswordRequestDto,
    @Admin() admin: Admin,
  ) {
    const adminId = admin.id;
    await this.authService.changePassword(adminId, body);
    return { success: true };
  }

  @Post('logout')
  async signOut(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const refreshToken = this.extractRefreshCookie(request);
    await this.authService.signOut(refreshToken);
    this.clearRefreshCookie(reply);
  }

  @Post('email-exists')
  async emailExists(@Body() body: EmailExistsRequestDto) {
    const exists = await this.authService.emailExists(body.email);
    return { exists };
  }

  private extractRefreshCookie(request: FastifyRequest): string | null {
    return (
      (request as FastifyRequest & { cookies?: Record<string, string> })
        .cookies?.[this.authService.refreshCookieName] ?? null
    );
  }

  private setRefreshCookie(reply: FastifyReply, token: string) {
    reply.setCookie(
      this.authService.refreshCookieName,
      token,
      this.authService.getRefreshCookieOptions(),
    );
  }

  private clearRefreshCookie(reply: FastifyReply) {
    reply.clearCookie(
      this.authService.refreshCookieName,
      this.authService.getRefreshCookieOptions(),
    );
  }

  private getUserAgent(request: FastifyRequest): string | null {
    const userAgent = request.headers['user-agent'];
    if (Array.isArray(userAgent)) {
      return userAgent[0] ?? null;
    }
    return userAgent ?? null;
  }
}
