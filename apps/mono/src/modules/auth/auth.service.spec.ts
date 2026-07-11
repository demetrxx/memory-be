import {
  AdminEntity,
  AdminRole,
  AdminStatus,
  RefreshSessionEntity,
} from '@app/core';
import { JwtService } from '@nestjs/jwt';

import { AppError } from '@/common/errors/app-error';

import { sha256 } from '../../common/utils';
import { AuthService } from './auth-admin.service';

const authConfig = {
  emailAuthEnabled: false,
  accessSecret: 'access-secret',
  refreshSecret: 'refresh-secret',
  accessTtlMinutes: 15,
  refreshTtlDays: 30,
  cookieDomain: undefined,
  cookiePath: '/auth',
  cookieSecure: true,
  cookieSameSite: 'lax',
};

type RepositoryMock = {
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
  createQueryBuilder: jest.Mock;
};

function makeRepositoryMock(): RepositoryMock {
  return {
    findOne: jest.fn(),
    create: jest.fn((entity) => entity),
    save: jest.fn(async (entity) => entity),
    update: jest.fn(async () => ({ affected: 1 })),
    createQueryBuilder: jest.fn(),
  };
}

describe('AuthService refresh rotation', () => {
  const admin = {
    id: 'admin-id',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: AdminRole.Owner,
    status: AdminStatus.Active,
  } as AdminEntity;

  const oldRefreshToken = 'old-refresh-token';
  const oldPayload = {
    sub: admin.id,
    email: admin.email,
    jti: 'old-session-id',
    typ: 'refresh',
  };

  let service: AuthService;
  let adminRepo: RepositoryMock;
  let refreshRepo: RepositoryMock;
  let managerRefreshRepo: RepositoryMock;
  let dataSource: {
    getRepository: jest.Mock;
    transaction: jest.Mock;
  };
  let jwtService: {
    verifyAsync: jest.Mock;
    signAsync: jest.Mock;
    decode: jest.Mock;
  };
  let queryBuilder: {
    setLock: jest.Mock;
    where: jest.Mock;
    getOne: jest.Mock;
  };
  let tokenPayloads: Map<string, any>;
  let tokenIndex: number;

  beforeEach(() => {
    adminRepo = makeRepositoryMock();
    refreshRepo = makeRepositoryMock();
    managerRefreshRepo = makeRepositoryMock();
    tokenPayloads = new Map();
    tokenIndex = 0;

    queryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    managerRefreshRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const manager = {
      getRepository: jest.fn((entity) => {
        if (entity === RefreshSessionEntity) {
          return managerRefreshRepo;
        }
        return adminRepo;
      }),
    };

    dataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === AdminEntity) {
          return adminRepo;
        }
        return refreshRepo;
      }),
      transaction: jest.fn(async (cb) => cb(manager)),
    };

    jwtService = {
      verifyAsync: jest.fn(async () => oldPayload),
      signAsync: jest.fn(async (payload) => {
        tokenIndex += 1;
        const token = `${payload.typ}-${payload.jti ?? payload.sub}-${tokenIndex}`;
        tokenPayloads.set(token, payload);
        return token;
      }),
      decode: jest.fn((token) => tokenPayloads.get(token)),
    };

    adminRepo.findOne.mockResolvedValue(admin);

    service = new AuthService(
      dataSource as any,
      jwtService as unknown as JwtService,
      { get: jest.fn(() => authConfig) } as any,
    );
  });

  function makeActiveSession(overrides: Partial<RefreshSessionEntity> = {}) {
    return {
      id: oldPayload.jti,
      adminId: admin.id,
      tokenHash: sha256(oldRefreshToken),
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      replacedById: null,
      userAgent: null,
      ip: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as RefreshSessionEntity;
  }

  it('rotates an active refresh session under a pessimistic row lock', async () => {
    const session = makeActiveSession();
    queryBuilder.getOne.mockResolvedValue(session);

    const result = await service.refreshToken(oldRefreshToken, {
      ip: '127.0.0.1',
      userAgent: 'agent',
    });

    expect(queryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(managerRefreshRepo.save).toHaveBeenCalledTimes(1);
    expect(managerRefreshRepo.update).toHaveBeenCalledWith(
      { id: session.id },
      expect.objectContaining({
        revokedAt: expect.any(Date),
        replacedById: expect.any(String),
      }),
    );
    expect(result.accessToken).toMatch(/^access-/);
    expect(result.refreshToken).toMatch(/^refresh-/);
  });

  it('allows a duplicate refresh in the grace window without issuing another refresh token', async () => {
    const session = makeActiveSession();
    let replacement: RefreshSessionEntity | null = null;

    queryBuilder.getOne
      .mockResolvedValueOnce(session)
      .mockResolvedValueOnce(session);
    managerRefreshRepo.save.mockImplementation(async (entity) => {
      replacement = entity;
      return entity;
    });
    managerRefreshRepo.update.mockImplementation(async (_criteria, values) => {
      session.revokedAt = values.revokedAt;
      session.replacedById = values.replacedById;
      return { affected: 1 };
    });
    managerRefreshRepo.findOne.mockImplementation(async () => replacement);

    const firstResult = await service.refreshToken(oldRefreshToken, {
      ip: '127.0.0.1',
      userAgent: 'agent',
    });
    const secondResult = await service.refreshToken(oldRefreshToken, {
      ip: '127.0.0.1',
      userAgent: 'agent',
    });

    expect(firstResult.refreshToken).toMatch(/^refresh-/);
    expect(secondResult.accessToken).toMatch(/^access-/);
    expect(secondResult.refreshToken).toBeUndefined();
    expect(managerRefreshRepo.save).toHaveBeenCalledTimes(1);
    expect(managerRefreshRepo.update).toHaveBeenCalledTimes(1);
  });

  it('revokes active sessions when an old replaced refresh token is reused outside the grace window', async () => {
    const session = makeActiveSession({
      revokedAt: new Date(Date.now() - 31_000),
      replacedById: 'new-session-id',
    });
    queryBuilder.getOne.mockResolvedValue(session);

    await expect(
      service.refreshToken(oldRefreshToken, {
        ip: '127.0.0.1',
        userAgent: 'agent',
      }),
    ).rejects.toBeInstanceOf(AppError);

    expect(managerRefreshRepo.update).toHaveBeenCalledWith(
      { adminId: admin.id, revokedAt: expect.any(Object) },
      { revokedAt: expect.any(Date) },
    );
  });

  it('rejects a revoked refresh session without a valid replacement', async () => {
    const session = makeActiveSession({
      revokedAt: new Date(),
      replacedById: 'missing-session-id',
    });
    queryBuilder.getOne.mockResolvedValue(session);
    managerRefreshRepo.findOne.mockResolvedValue(null);

    await expect(
      service.refreshToken(oldRefreshToken, {
        ip: '127.0.0.1',
        userAgent: 'agent',
      }),
    ).rejects.toBeInstanceOf(AppError);

    expect(managerRefreshRepo.save).not.toHaveBeenCalled();
  });

  it('rejects an expired active refresh session', async () => {
    const session = makeActiveSession({
      expiresAt: new Date(Date.now() - 1_000),
    });
    queryBuilder.getOne.mockResolvedValue(session);

    await expect(
      service.refreshToken(oldRefreshToken, {
        ip: '127.0.0.1',
        userAgent: 'agent',
      }),
    ).rejects.toBeInstanceOf(AppError);

    expect(managerRefreshRepo.save).not.toHaveBeenCalled();
  });

});
