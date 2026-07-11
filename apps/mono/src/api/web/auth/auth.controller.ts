import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { AuthWebService, ProtectedWeb, UserWeb } from '@/modules/auth';

import {
  ChangePasswordRequestDto,
  ConfirmOtpRequestDto,
  EmailExistsRequestDto,
  GoogleAuthRequestDto,
  RegisterRequestDto,
  SendOtpRequestDto,
  SignInRequestDto,
  UserWebDto,
} from './dtos';

@Controller('/')
export class AuthController {
  constructor(private readonly authService: AuthWebService) {}

  @Post('/otp/send')
  @ProtectedWeb(true)
  async sendOtp(@UserWeb() user: UserWeb, @Body() body: SendOtpRequestDto) {
    await this.authService.sendOtp(user.id, body.purpose, body.email);
    return { success: true };
  }

  @Post('/otp/confirm')
  @ProtectedWeb(true)
  async confirmOtp(
    @UserWeb() user: UserWeb,
    @Body() body: ConfirmOtpRequestDto,
  ) {
    const otpId = await this.authService.confirmOtp(
      user.id,
      body.purpose,
      body.code,
    );
    return { otpId };
  }

  @ProtectedWeb(true)
  @Get('me')
  async me(@UserWeb() user: UserWeb): Promise<UserWebDto> {
    return UserWebDto.mapFromEntity(user);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/anonymous')
  async createAnonymous(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokens = await this.authService.createAnonymous({
      ip: request.ip,
      userAgent: this.getUserAgent(request),
    });

    this.setRefreshCookie(reply, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
    };
  }

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

  @Post('/google')
  async signInWithGoogle(
    @Body() body: GoogleAuthRequestDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const currentUser =
      await this.authService.authenticateOptionalAuthorizationHeader(
        request.headers.authorization,
      );
    const tokens = await this.authService.signInWithGoogle(
      { credential: body.credential, currentUser },
      {
        ip: request.ip,
        userAgent: this.getUserAgent(request),
      },
    );
    this.setRefreshCookie(reply, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('/google/link')
  @ProtectedWeb()
  async linkGoogle(
    @Body() body: GoogleAuthRequestDto,
    @UserWeb() user: UserWeb,
  ) {
    await this.authService.linkGoogle(user, body.credential);
    return { success: true };
  }

  @Post('/google/unlink')
  @ProtectedWeb()
  async unlinkGoogle(@UserWeb() user: UserWeb) {
    await this.authService.unlinkGoogle(user);
    return { success: true };
  }

  @Post('/register')
  @ProtectedWeb(true)
  async register(
    @Body() body: RegisterRequestDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @UserWeb() user: UserWeb,
  ) {
    const tokens = await this.authService.signUp(body, user, {
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
  async changePassword(@Body() body: ChangePasswordRequestDto) {
    await this.authService.changePassword(body);
    return { success: true };
  }

  @Post('logout')
  @ProtectedWeb(true)
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
