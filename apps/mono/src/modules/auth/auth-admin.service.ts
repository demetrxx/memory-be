import { randomUUID } from 'node:crypto';

import {
  AdminEntity,
  AdminRole,
  AdminStatus,
  RefreshSessionEntity,
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

type AccessTokenPayload = {
  sub: string;
  email: string;
  typ: 'access';
};

type RefreshTokenPayload = {
  sub: string;
  email: string;
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
  email: string;
  password: string;
  fullName?: string;
  invitedById: string;
  role: AdminRole;
};

type SignInPayload = {
  email: string;
  password: string;
};

const REFRESH_REUSE_GRACE_MS = 30_000;

@Injectable()
export class AuthAdminService {
  private readonly logger = new Logger(AuthAdminService.name);

  readonly refreshCookieName = 'refresh_token';

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(payload: SignInPayload, meta: TokenMeta): Promise<AuthTokens> {
    const email = this.normalizeEmail(payload.email);
    const userRepository = this.dataSource.getRepository(AdminEntity);
    const user = await userRepository.findOne({
      where: { email, status: AdminStatus.Active },
    });

    if (!user?.passwordHash) {
      throw Err.unauthorized();
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValid) {
      throw Err.unauthorized();
    }

    return this.issueTokens(user, meta);
  }

  async signUp(payload: SignUpPayload, meta?: TokenMeta): Promise<AuthTokens> {
    const email = this.normalizeEmail(payload.email);
    const adminRepository = this.dataSource.getRepository(AdminEntity);

    const existing = await adminRepository.findOne({ where: { email } });
    if (existing) {
      throw Err.conflict('Email already exists.');
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const { firstName, lastName } = this.splitFullName(payload.fullName);

    const admin = adminRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role: payload.role,
      invitedById: payload.invitedById,
      status: AdminStatus.Active,
    });

    const saved = await adminRepository.save(admin);

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

    const adminRepository = this.dataSource.getRepository(AdminEntity);
    const admin = await adminRepository.findOne({
      where: { id: payload.sub, status: AdminStatus.Active },
    });

    if (!admin) {
      await this.revokeAllAdminSessions(payload.sub);
      throw Err.unauthorized();
    }

    return this.rotateRefreshSession(admin, refreshToken, payload, meta);
  }

  async emailExists(email: string) {
    const adminRepository = this.dataSource.getRepository(AdminEntity);
    const normalized = this.normalizeEmail(email);
    const exists = await adminRepository.exists({
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

    const refreshRepository =
      this.dataSource.getRepository(RefreshSessionEntity);
    await refreshRepository.update(
      { id: payload.jti },
      { revokedAt: new Date() },
    );
  }

  async changePassword(
    adminId: string,
    payload: { oldPassword: string; newPassword: string },
  ): Promise<void> {
    const adminRepository = this.dataSource.getRepository(AdminEntity);
    const admin = await adminRepository.findOne({
      where: { id: adminId, status: AdminStatus.Active },
    });

    if (!admin?.passwordHash) {
      throw Err.badRequest('Password is not set');
    }

    const isValid = await bcrypt.compare(
      payload.oldPassword,
      admin.passwordHash,
    );
    if (!isValid) {
      throw Err.unauthorized();
    }

    admin.passwordHash = await bcrypt.hash(payload.newPassword, 12);
    await adminRepository.save(admin);

    await this.revokeAllAdminSessions(admin.id);
  }

  async authenticateAuthorizationHeader(
    authorizationHeader: string | undefined,
    roles?: AdminRole[],
  ): Promise<AdminEntity> {
    const token = this.extractBearerToken(authorizationHeader);

    if (!token) {
      throw new UnauthorizedException();
    }

    const authConfig = this.getAuthConfig();
    const looksLikeJwt = token.split('.').length === 3;

    let user: AdminEntity | null = null;

    if (!looksLikeJwt && authConfig.emailAuthEnabled) {
      user = await this.dataSource.getRepository(AdminEntity).findOne({
        where: {
          email: token,
          status: AdminStatus.Active,
        },
      });
    } else {
      if (!authConfig.accessSecretAdmin) {
        throw new UnauthorizedException();
      }

      try {
        const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
          token,
          {
            secret: authConfig.accessSecretAdmin,
          },
        );

        if (payload.typ !== 'access') {
          throw new UnauthorizedException();
        }

        user = await this.dataSource.getRepository(AdminEntity).findOne({
          where: {
            id: payload.sub,
            status: AdminStatus.Active,
          },
        });
      } catch {
        throw new UnauthorizedException();
      }
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    this.assertRoles(user, roles);

    return user;
  }

  async authenticateRefreshToken(
    refreshToken: string | null,
    roles?: AdminRole[],
  ): Promise<AdminEntity> {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.dataSource
      .getRepository(RefreshSessionEntity)
      .findOne({
        where: {
          id: payload.jti,
          adminId: payload.sub,
          revokedAt: IsNull(),
        },
      });

    if (!session || session.expiresAt <= new Date()) {
      throw new UnauthorizedException();
    }

    if (session.tokenHash !== sha256(refreshToken)) {
      throw new UnauthorizedException();
    }

    const user = await this.dataSource.getRepository(AdminEntity).findOne({
      where: {
        id: payload.sub,
        status: AdminStatus.Active,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    this.assertRoles(user, roles);

    return user;
  }

  async authenticateRequest(
    opts: {
      authorizationHeader?: string;
      refreshToken?: string | null;
      roles?: AdminRole[];
    } = {},
  ): Promise<AdminEntity> {
    const { authorizationHeader, refreshToken, roles } = opts;

    if (authorizationHeader) {
      return this.authenticateAuthorizationHeader(authorizationHeader, roles);
    }

    return this.authenticateRefreshToken(refreshToken ?? null, roles);
  }

  getRefreshCookieOptions() {
    const authConfig = this.getAuthConfig();
    const sameSite = this.normalizeSameSite(authConfig.cookieSameSite) as
      'strict' | 'lax' | 'none';
    const maxAge = authConfig.refreshTtlDaysAdmin * 24 * 60 * 60;

    return {
      httpOnly: true,
      secure: authConfig.cookieSecure,
      sameSite,
      domain: authConfig.cookieDomain,
      path: authConfig.cookiePathAdmin,
      maxAge,
    };
  }

  private async issueTokens(
    admin: AdminEntity,
    meta: TokenMeta,
  ): Promise<AuthTokens> {
    const accessToken = await this.signAccessToken(admin);
    const refreshToken = await this.signRefreshToken(admin);
    await this.persistRefreshSession(admin, refreshToken, meta);

    return { accessToken, refreshToken };
  }

  private async rotateRefreshSession(
    admin: AdminEntity,
    refreshToken: string,
    payload: RefreshTokenPayload,
    meta: TokenMeta,
  ): Promise<RefreshAuthTokens> {
    const tokenHash = sha256(refreshToken);

    return this.dataSource.transaction(async (manager) => {
      const refreshRepo = manager.getRepository(RefreshSessionEntity);
      const existing = await refreshRepo
        .createQueryBuilder('session')
        .setLock('pessimistic_write')
        .where('session.id = :id', { id: payload.jti })
        .getOne();

      if (!existing || existing.adminId !== admin.id) {
        await this.revokeAllAdminSessions(admin.id, manager);
        throw Err.unauthorized();
      }

      if (existing.tokenHash !== tokenHash) {
        await this.revokeAllAdminSessions(admin.id, manager);
        throw Err.unauthorized();
      }

      if (existing.revokedAt) {
        return this.handleReusedRefreshSession(manager, admin, existing);
      }

      if (existing.expiresAt <= new Date()) {
        await this.revokeAllAdminSessions(admin.id, manager);
        throw Err.unauthorized();
      }

      const newRefreshToken = await this.signRefreshToken(admin);
      const newSession = refreshRepo.create({
        id: this.extractJti(newRefreshToken),
        adminId: admin.id,
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

      const accessToken = await this.signAccessToken(admin);
      return { accessToken, refreshToken: newRefreshToken };
    });
  }

  private async persistRefreshSession(
    admin: AdminEntity,
    refreshToken: string,
    meta: TokenMeta,
  ) {
    const refreshRepository =
      this.dataSource.getRepository(RefreshSessionEntity);
    const session = refreshRepository.create({
      id: this.extractJti(refreshToken),
      adminId: admin.id,
      tokenHash: sha256(refreshToken),
      expiresAt: this.getRefreshExpiryDate(),
      userAgent: meta.userAgent,
      ip: meta.ip,
    });

    await refreshRepository.save(session);
  }

  private async handleReusedRefreshSession(
    manager: EntityManager,
    admin: AdminEntity,
    session: RefreshSessionEntity,
  ): Promise<RefreshAuthTokens> {
    const isWithinGrace =
      Boolean(session.replacedById) &&
      Date.now() - session.revokedAt.getTime() <= REFRESH_REUSE_GRACE_MS;

    if (isWithinGrace) {
      const replacement = await manager
        .getRepository(RefreshSessionEntity)
        .findOne({
          where: {
            id: session.replacedById,
            adminId: admin.id,
            revokedAt: IsNull(),
          },
        });

      if (replacement && replacement.expiresAt > new Date()) {
        return { accessToken: await this.signAccessToken(admin) };
      }
    }

    await this.revokeAllAdminSessions(admin.id, manager);
    throw Err.unauthorized();
  }

  private async signAccessToken(admin: AdminEntity): Promise<string> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.accessSecretAdmin) {
      throw Err.internal('AUTH_ACCESS_SECRET is not set');
    }

    const payload: AccessTokenPayload = {
      sub: admin.id,
      email: admin.email,
      typ: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: authConfig.accessSecretAdmin,
      expiresIn: `${authConfig.accessTtlMinutesAdmin}m`,
    });
  }

  private async signRefreshToken(admin: AdminEntity): Promise<string> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.refreshSecretAdmin) {
      throw Err.internal('AUTH_REFRESH_SECRET is not set');
    }

    const payload: RefreshTokenPayload = {
      sub: admin.id,
      email: admin.email,
      jti: randomUUID(),
      typ: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: authConfig.refreshSecretAdmin,
      expiresIn: `${authConfig.refreshTtlDaysAdmin}d`,
    });
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.refreshSecretAdmin) {
      throw Err.internal('AUTH_REFRESH_SECRET is not set');
    }

    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: authConfig.refreshSecretAdmin,
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
    expiresAt.setDate(expiresAt.getDate() + authConfig.refreshTtlDaysAdmin);
    return expiresAt;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
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

  private async revokeAllAdminSessions(
    adminId: string,
    manager?: EntityManager,
  ) {
    const refreshRepository = (manager ?? this.dataSource).getRepository(
      RefreshSessionEntity,
    );
    await refreshRepository.update(
      { adminId, revokedAt: IsNull() },
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

  private assertRoles(user: AdminEntity, roles?: AdminRole[]) {
    if (roles?.length && !roles.includes(user.role)) {
      throw new UnauthorizedException();
    }
  }

  private getAuthConfig(): AuthConfig {
    const config = this.configService.get<AuthConfig>('auth');
    if (!config) {
      throw Err.internal('Auth config is missing');
    }
    return config;
  }
}
