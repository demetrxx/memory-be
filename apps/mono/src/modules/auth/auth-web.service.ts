import { randomUUID } from 'node:crypto';

import {
  OtpPurpose,
  RefreshWebSessionEntity,
  UserEntity,
  UserStatus,
} from '@app/core';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, EntityManager, IsNull } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { sha256 } from '@/common/utils';
import { AuthConfig } from '@/config';
import { DEFAULT_CREDITS, DEFAULT_SIGNUP_CREDITS } from '@/modules/user';

import { UserWeb } from './decorators';
import { GoogleIdentityService } from './google-identity.service';
import { OtpService } from './otp.service';

type AccessTokenPayload = {
  sub: string;
  email: string | null;
  typ: 'access';
};

type RefreshTokenPayload = {
  sub: string;
  email: string | null;
  jti: string;
  typ: 'refresh';
};

type TokenMeta = {
  ip: string | null;
  userAgent: string | null;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type RefreshAuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

type SignUpPayload = {
  otpId: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

type SignInPayload = {
  email: string;
  password: string;
};

type GoogleSignInPayload = {
  credential: string;
  currentUser?: UserEntity | null;
};

const REFRESH_REUSE_GRACE_MS = 30_000;

@Injectable()
export class AuthWebService {
  private readonly logger = new Logger(AuthWebService.name);

  readonly refreshCookieName = 'refresh_token';

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly googleIdentityService: GoogleIdentityService,
    private readonly otpService: OtpService,
  ) {}

  async me(userId: string) {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw Err.notFound('User not found');
    }
    return user;
  }

  async sendOtp(userId: string, purpose: OtpPurpose, email: string) {
    if (purpose === OtpPurpose.VerifyEmail) {
      if (!email) {
        throw Err.badRequest('Email is required');
      }
      const emailExists = await this.dataSource
        .getRepository(UserEntity)
        .exists({
          where: { email },
        });

      if (emailExists) {
        throw Err.badRequest('Email already exists');
      }
    }

    if (purpose === OtpPurpose.ResetPassword) {
      const user = await this.dataSource.getRepository(UserEntity).findOne({
        where: { email, status: UserStatus.Active },
      });
      if (!user) {
        throw Err.notFound('User not found');
      }

      if (!user.email) {
        throw Err.badRequest('Email is not set');
      }
    }

    await this.otpService.send(userId, email, purpose);
  }

  async confirmOtp(userId: string, purpose: OtpPurpose, code: string) {
    return this.otpService.activate(userId, purpose, code);
  }

  async createAnonymous(meta: TokenMeta): Promise<AuthTokens> {
    const repository = this.dataSource.getRepository(UserEntity);

    const user = await repository.save({
      email: null,
      passwordHash: null,
      isAnonymous: true,
      status: UserStatus.Active,
      credits: DEFAULT_CREDITS,
      anonymousData: {},
    });

    return this.issueTokens(user, meta);
  }

  async signIn(payload: SignInPayload, meta: TokenMeta): Promise<AuthTokens> {
    const email = this.normalizeEmail(payload.email);
    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: { email, status: UserStatus.Active },
    });

    if (!user?.passwordHash) {
      if (user.googleSub) {
        throw Err.unauthorized(
          'Sign in with Google, or click "Forgot password"',
          {
            action: 'GOOGLE_SIGN_IN',
          },
        );
      }

      throw Err.unauthorized();
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValid) {
      throw Err.unauthorized();
    }

    return this.issueTokens(user, meta);
  }

  async signInWithGoogle(
    payload: GoogleSignInPayload,
    meta: TokenMeta,
  ): Promise<AuthTokens> {
    const googleIdentity = await this.googleIdentityService.verifyCredential(
      payload.credential,
    );
    const userRepository = this.dataSource.getRepository(UserEntity);

    const userByGoogleSub = await userRepository.findOne({
      where: {
        googleSub: googleIdentity.sub,
        status: UserStatus.Active,
      },
    });
    if (userByGoogleSub) {
      await this.fillMissingGoogleProfileFields(
        userByGoogleSub,
        googleIdentity,
      );
      return this.issueTokens(userByGoogleSub, meta);
    }

    const userByEmail = await userRepository.findOne({
      where: {
        email: googleIdentity.email,
        status: UserStatus.Active,
      },
    });
    if (userByEmail) {
      if (userByEmail.googleSub) {
        throw Err.conflict('Email is already linked to another Google account');
      }
      userByEmail.googleSub = googleIdentity.sub;
      userByEmail.isAnonymous = false;
      userByEmail.anonymousData = null;
      this.applyMissingGoogleProfileFields(userByEmail, googleIdentity);
      const saved = await userRepository.save(userByEmail);
      return this.issueTokens(saved, meta);
    }

    const currentUser = payload.currentUser;
    if (currentUser?.isAnonymous) {
      const saved = await userRepository.save({
        id: currentUser.id,
        isAnonymous: false,
        anonymousData: null,
        email: googleIdentity.email,
        googleSub: googleIdentity.sub,
        firstName: currentUser.firstName ?? googleIdentity.firstName,
        lastName: currentUser.lastName ?? googleIdentity.lastName,
        status: UserStatus.Active,
      });
      return this.issueTokens(saved, meta);
    }

    const saved = await userRepository.save({
      email: googleIdentity.email,
      googleSub: googleIdentity.sub,
      firstName: googleIdentity.firstName,
      lastName: googleIdentity.lastName,
      passwordHash: null,
      isAnonymous: false,
      status: UserStatus.Active,
      credits: DEFAULT_SIGNUP_CREDITS,
    });

    return this.issueTokens(saved, meta);
  }

  async linkGoogle(user: { id: string }, credential: string): Promise<void> {
    const googleIdentity =
      await this.googleIdentityService.verifyCredential(credential);
    const userRepository = this.dataSource.getRepository(UserEntity);
    const currentUser = await userRepository.findOne({
      where: { id: user.id, status: UserStatus.Active },
    });

    if (!currentUser) {
      throw Err.notFound('User not found');
    }

    if (currentUser.isAnonymous) {
      throw Err.forbidden('Anonymous user not allowed', {
        action: 'REGISTER',
      });
    }

    if (
      !currentUser.email ||
      this.normalizeEmail(currentUser.email) !== googleIdentity.email
    ) {
      throw Err.conflict('Google email does not match user email');
    }

    if (currentUser.googleSub === googleIdentity.sub) {
      return;
    }

    if (currentUser.googleSub) {
      throw Err.conflict('Another Google account is already linked');
    }

    const owner = await userRepository.findOne({
      where: {
        googleSub: googleIdentity.sub,
        status: UserStatus.Active,
      },
    });
    if (owner && owner.id !== currentUser.id) {
      throw Err.conflict('Google account is already linked to another user');
    }

    currentUser.googleSub = googleIdentity.sub;
    this.applyMissingGoogleProfileFields(currentUser, googleIdentity);
    await userRepository.save(currentUser);
  }

  async unlinkGoogle(user: { id: string }): Promise<void> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const currentUser = await userRepository.findOne({
      where: { id: user.id, status: UserStatus.Active },
    });

    if (!currentUser) {
      throw Err.notFound('User not found');
    }

    if (currentUser.isAnonymous) {
      throw Err.forbidden('Anonymous user not allowed', {
        action: 'REGISTER',
      });
    }

    if (!currentUser.googleSub) {
      return;
    }

    if (!currentUser.passwordHash) {
      throw Err.badRequest('Cannot unlink the last auth provider');
    }

    currentUser.googleSub = null;
    await userRepository.save(currentUser);
  }

  async signUp(
    payload: SignUpPayload,
    user: UserWeb,
    meta?: TokenMeta,
  ): Promise<AuthTokens> {
    const otp = await this.otpService.findOne(
      payload.otpId,
      OtpPurpose.VerifyEmail,
      user.id,
    );

    if (!otp) {
      throw Err.notFound('Invalid or expired OTP');
    }

    const email = this.normalizeEmail(otp.payload.email);
    const userRepository = this.dataSource.getRepository(UserEntity);

    const existing = await userRepository.findOne({ where: { email } });
    if (existing) {
      throw Err.conflict('Email already exists.');
    }

    if (!user.isAnonymous) {
      throw Err.forbidden('Sign out first');
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);

    const saved = await userRepository.save({
      id: user.id,
      isAnonymous: false,
      email,
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      status: UserStatus.Active,
    });

    return meta
      ? this.issueTokens(saved, meta)
      : { accessToken: '', refreshToken: '' };
  }

  async refreshToken(
    refreshToken: string | null,
    meta: TokenMeta,
  ): Promise<RefreshAuthTokens> {
    if (!refreshToken) {
      throw Err.unauthorized();
    }

    const payload = await this.verifyRefreshToken(refreshToken);

    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: { id: payload.sub, status: UserStatus.Active },
    });

    if (!user) {
      await this.revokeAllSessions(payload.sub);
      throw Err.unauthorized();
    }

    userRepository.update(user.id, {
      lastActivityAt: new Date(),
    });

    return this.rotateRefreshSession(user, refreshToken, payload, meta);
  }

  async emailExists(email: string) {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const normalized = this.normalizeEmail(email);
    const exists = await userRepository.exists({
      where: { email: normalized },
    });
    return exists;
  }

  async signOut(refreshToken: string | null): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const payload = await this.tryVerifyRefreshToken(refreshToken);
    if (!payload) {
      return;
    }

    const refreshRepository = this.dataSource.getRepository(
      RefreshWebSessionEntity,
    );
    await refreshRepository.update(
      { id: payload.jti },
      { revokedAt: new Date() },
    );
  }

  async changePassword(payload: {
    otpId: string;
    newPassword: string;
  }): Promise<void> {
    const otp = await this.otpService.findOne(
      payload.otpId,
      OtpPurpose.ResetPassword,
    );

    if (!otp) {
      throw Err.notFound('Invalid or expired OTP');
    }

    const userRepository = this.dataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: {
        status: UserStatus.Active,
        email: otp.payload.email,
      },
    });

    user.passwordHash = await bcrypt.hash(payload.newPassword, 12);
    await userRepository.save(user);

    await this.revokeAllSessions(user.id);
  }

  async authenticateAuthorizationHeader(
    authorizationHeader: string | undefined,
  ): Promise<UserEntity> {
    const token = this.extractBearerToken(authorizationHeader);

    if (!token) {
      throw new UnauthorizedException();
    }

    const authConfig = this.getAuthConfig();
    const looksLikeJwt = token.split('.').length === 3;

    let user: UserEntity | null = null;

    if (!looksLikeJwt && authConfig.emailAuthEnabled) {
      user = await this.dataSource.getRepository(UserEntity).findOne({
        where: {
          email: token,
          status: UserStatus.Active,
        },
        relations: ['subscription'],
      });
    } else {
      if (!authConfig.accessSecretWeb) {
        throw new UnauthorizedException();
      }

      try {
        const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
          token,
          {
            secret: authConfig.accessSecretWeb,
          },
        );

        if (payload.typ !== 'access') {
          throw new UnauthorizedException();
        }

        user = await this.dataSource.getRepository(UserEntity).findOne({
          where: {
            id: payload.sub,
            status: UserStatus.Active,
          },
          relations: ['subscription'],
        });
      } catch {
        throw new UnauthorizedException();
      }
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async authenticateOptionalAuthorizationHeader(
    authorizationHeader: string | undefined,
  ): Promise<UserEntity | null> {
    if (!this.extractBearerToken(authorizationHeader)) {
      return null;
    }
    return this.authenticateAuthorizationHeader(authorizationHeader);
  }

  async authenticateRefreshToken(
    refreshToken: string | null,
  ): Promise<UserEntity> {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.dataSource
      .getRepository(RefreshWebSessionEntity)
      .findOne({
        where: {
          id: payload.jti,
          userId: payload.sub,
          revokedAt: IsNull(),
        },
      });

    if (!session || session.expiresAt <= new Date()) {
      throw new UnauthorizedException();
    }

    if (session.tokenHash !== sha256(refreshToken)) {
      throw new UnauthorizedException();
    }

    const user = await this.dataSource.getRepository(UserEntity).findOne({
      where: {
        id: payload.sub,
        status: UserStatus.Active,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async authenticateRequest(
    opts: {
      authorizationHeader?: string;
      refreshToken?: string | null;
    } = {},
  ): Promise<UserEntity> {
    const { authorizationHeader, refreshToken } = opts;

    if (authorizationHeader) {
      return this.authenticateAuthorizationHeader(authorizationHeader);
    }

    return this.authenticateRefreshToken(refreshToken ?? null);
  }

  getRefreshCookieOptions() {
    const authConfig = this.getAuthConfig();
    const sameSite = 'lax' as const;
    const maxAge = authConfig.refreshTtlDaysWeb * 24 * 60 * 60;

    return {
      httpOnly: true,
      secure: authConfig.cookieSecure,
      sameSite,
      domain: authConfig.webCookieDomain,
      path: authConfig.cookiePathWeb,
      maxAge,
    };
  }

  private async issueTokens(
    admin: UserEntity,
    meta: TokenMeta,
  ): Promise<AuthTokens> {
    const accessToken = await this.signAccessToken(admin);
    const refreshToken = await this.signRefreshToken(admin);
    await this.persistRefreshSession(admin, refreshToken, meta);

    return { accessToken, refreshToken };
  }

  private async rotateRefreshSession(
    user: UserEntity,
    refreshToken: string,
    payload: RefreshTokenPayload,
    meta: TokenMeta,
  ): Promise<RefreshAuthTokens> {
    const tokenHash = sha256(refreshToken);

    return this.dataSource.transaction(async (manager) => {
      const refreshRepo = manager.getRepository(RefreshWebSessionEntity);
      const existing = await refreshRepo
        .createQueryBuilder('session')
        .setLock('pessimistic_write')
        .where('session.id = :id', { id: payload.jti })
        .getOne();

      if (!existing || existing.userId !== user.id) {
        await this.revokeAllSessions(user.id, manager);
        throw Err.unauthorized();
      }

      if (existing.tokenHash !== tokenHash) {
        await this.revokeAllSessions(user.id, manager);
        throw Err.unauthorized();
      }

      if (existing.revokedAt) {
        return this.handleReusedRefreshSession(manager, user, existing);
      }

      if (existing.expiresAt <= new Date()) {
        await this.revokeAllSessions(user.id, manager);
        throw Err.unauthorized();
      }

      const newRefreshToken = await this.signRefreshToken(user);
      const newSession = refreshRepo.create({
        id: this.extractJti(newRefreshToken),
        userId: user.id,
        tokenHash: sha256(newRefreshToken),
        expiresAt: this.getRefreshExpiryDate(),
        userAgent: meta.userAgent,
        ip: meta.ip,
      });

      await refreshRepo.save(newSession);

      await refreshRepo.update(
        { id: existing.id },
        { revokedAt: new Date(), replacedById: newSession.id },
      );

      const accessToken = await this.signAccessToken(user);
      return { accessToken, refreshToken: newRefreshToken };
    });
  }

  private async persistRefreshSession(
    user: UserEntity,
    refreshToken: string,
    meta: TokenMeta,
  ) {
    const refreshRepository = this.dataSource.getRepository(
      RefreshWebSessionEntity,
    );
    const session = refreshRepository.create({
      id: this.extractJti(refreshToken),
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: this.getRefreshExpiryDate(),
      userAgent: meta.userAgent,
      ip: meta.ip,
    });

    await refreshRepository.save(session);
  }

  private async handleReusedRefreshSession(
    manager: EntityManager,
    user: UserEntity,
    session: RefreshWebSessionEntity,
  ): Promise<RefreshAuthTokens> {
    const isWithinGrace =
      Boolean(session.replacedById) &&
      Date.now() - session.revokedAt.getTime() <= REFRESH_REUSE_GRACE_MS;

    if (isWithinGrace) {
      const replacement = await manager
        .getRepository(RefreshWebSessionEntity)
        .findOne({
          where: {
            id: session.replacedById,
            userId: user.id,
            revokedAt: IsNull(),
          },
        });

      if (replacement && replacement.expiresAt > new Date()) {
        return { accessToken: await this.signAccessToken(user) };
      }
    }

    await this.revokeAllSessions(user.id, manager);
    throw Err.unauthorized();
  }

  private async signAccessToken(user: UserEntity): Promise<string> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.accessSecretWeb) {
      throw Err.internal('AUTH_ACCESS_SECRET is not set');
    }

    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      typ: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: authConfig.accessSecretWeb,
      expiresIn: `${authConfig.accessTtlMinutesWeb}m`,
    });
  }

  private async signRefreshToken(user: UserEntity): Promise<string> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.refreshSecretWeb) {
      throw Err.internal('AUTH_REFRESH_SECRET is not set');
    }

    const payload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      jti: randomUUID(),
      typ: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: authConfig.refreshSecretWeb,
      expiresIn: `${authConfig.refreshTtlDaysWeb}d`,
    });
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.refreshSecretWeb) {
      throw Err.internal('AUTH_REFRESH_SECRET is not set');
    }

    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: authConfig.refreshSecretWeb,
        },
      );

      if (payload.typ !== 'refresh') {
        throw Err.unauthorized();
      }

      return payload;
    } catch {
      throw Err.unauthorized();
    }
  }

  private async tryVerifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload | null> {
    try {
      return await this.verifyRefreshToken(refreshToken);
    } catch {
      return null;
    }
  }

  private extractJti(refreshToken: string): string {
    const payload = this.jwtService.decode(refreshToken) as RefreshTokenPayload;
    if (!payload?.jti) {
      throw Err.unauthorized();
    }
    return payload.jti;
  }

  private getRefreshExpiryDate(): Date {
    const authConfig = this.getAuthConfig();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + authConfig.refreshTtlDaysWeb);
    return expiresAt;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async fillMissingGoogleProfileFields(
    user: UserEntity,
    googleIdentity: { firstName: string | null; lastName: string | null },
  ) {
    const firstName = user.firstName ?? googleIdentity.firstName;
    const lastName = user.lastName ?? googleIdentity.lastName;
    if (firstName === user.firstName && lastName === user.lastName) {
      return;
    }
    user.firstName = firstName;
    user.lastName = lastName;
    await this.dataSource.getRepository(UserEntity).save(user);
  }

  private applyMissingGoogleProfileFields(
    user: UserEntity,
    googleIdentity: { firstName: string | null; lastName: string | null },
  ) {
    user.firstName = user.firstName ?? googleIdentity.firstName;
    user.lastName = user.lastName ?? googleIdentity.lastName;
  }

  private splitFullName(fullName?: string) {
    if (!fullName) {
      return { firstName: null, lastName: null };
    }

    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { firstName: null, lastName: null };
    }

    return {
      firstName: parts[0] ?? null,
      lastName: parts.slice(1).join(' ') || null,
    };
  }

  private async revokeAllSessions(userId: string, manager?: EntityManager) {
    const refreshRepository = (manager ?? this.dataSource).getRepository(
      RefreshWebSessionEntity,
    );
    await refreshRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private normalizeSameSite(value: string) {
    if (value === 'none' || value === 'strict' || value === 'lax') {
      return value;
    }
    return 'lax';
  }

  private extractBearerToken(header: string | undefined): string | null {
    const [type, token] = header ? header.split(' ') : [];

    return type === 'Bearer' ? token : null;
  }

  private getAuthConfig(): AuthConfig {
    const config = this.configService.get<AuthConfig>('auth');
    if (!config) {
      throw Err.internal('Auth config is missing');
    }
    return config;
  }
}
