import {
  AuthProvider,
  RefreshSessionEntity,
  UserEntity,
  UserStatus,
} from '@app/core';
import { JwtService } from '@nestjs/jwt';

import { AppError } from '@/common/errors/app-error';
import { DEFAULT_SIGNUP_CREDITS } from '@/modules/user';

import { ProfileResponseDto } from '../../api/web/profile/dtos/response.dtos';
import { AuthWebService } from './auth-web.service';

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
    save: jest.fn(async (entity) => ({
      id: entity.id ?? 'new-user-id',
      ...entity,
    })),
    update: jest.fn(async () => ({ affected: 1 })),
    createQueryBuilder: jest.fn(),
  };
}

function makeUser(overrides: Partial<UserEntity> = {}) {
  return {
    id: 'user-id',
    firstName: null,
    lastName: null,
    username: null,
    isAnonymous: false,
    status: UserStatus.Active,
    credits: 50,
    email: 'user@example.com',
    passwordHash: null,
    googleSub: null,
    anonymousData: null,
    ...overrides,
  } as UserEntity;
}

describe('AuthService Google sign-in', () => {
  const googleIdentity = {
    sub: 'google-sub',
    email: 'user@example.com',
    firstName: 'Google',
    lastName: 'User',
  };

  let service: AuthWebService;
  let userRepo: RepositoryMock;
  let refreshRepo: RepositoryMock;
  let dataSource: { getRepository: jest.Mock };
  let jwtService: {
    signAsync: jest.Mock;
    decode: jest.Mock;
  };
  let googleIdentityService: {
    verifyCredential: jest.Mock;
  };
  let otpService: {
    generateOtp: jest.Mock;
    verifyOtp: jest.Mock;
  };
  let tokenPayloads: Map<string, any>;
  let tokenIndex: number;

  beforeEach(() => {
    userRepo = makeRepositoryMock();
    refreshRepo = makeRepositoryMock();
    tokenPayloads = new Map();
    tokenIndex = 0;

    dataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === UserEntity) return userRepo;
        if (entity === RefreshSessionEntity) return refreshRepo;
        throw new Error('Unexpected repository');
      }),
    };

    jwtService = {
      signAsync: jest.fn(async (payload) => {
        tokenIndex += 1;
        const token = `${payload.typ}-${payload.jti ?? payload.sub}-${tokenIndex}`;
        tokenPayloads.set(token, payload);
        return token;
      }),
      decode: jest.fn((token) => tokenPayloads.get(token)),
    };

    googleIdentityService = {
      verifyCredential: jest.fn(async () => googleIdentity),
    };

    otpService = {
      generateOtp: jest.fn(async () => '123456'),
      verifyOtp: jest.fn(async () => true),
    };

    service = new AuthWebService(
      dataSource as any,
      jwtService as unknown as JwtService,
      {
        get: jest.fn(() => ({
          accessSecret: '-access-secret',
          refreshSecret: '-refresh-secret',
          accessTtlMinutes: 15,
          refreshTtlDays: 30,
          cookieSecure: true,
          cookieSameSite: 'lax',
          cookieDomain: undefined,
          cookiePath: '//auth',
        })),
      } as any,
      googleIdentityService as any,
      otpService as any,
    );
  });

  it('propagates invalid Google credential failures', async () => {
    googleIdentityService.verifyCredential.mockRejectedValueOnce(
      new AppError('UNAUTHORIZED', 'Invalid Google credential'),
    );

    await expect(
      service.signInWithGoogle(
        { credential: 'bad-google-token' },
        { ip: null, userAgent: null },
      ),
    ).rejects.toBeInstanceOf(AppError);

    expect(userRepo.findOne).not.toHaveBeenCalled();
  });

  it('creates a new registered  user from Google claims', async () => {
    userRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const result = await service.signInWithGoogle(
      { credential: 'google-token' },
      { ip: '127.0.0.1', userAgent: 'agent' },
    );

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: googleIdentity.email,
        googleSub: googleIdentity.sub,
        firstName: googleIdentity.firstName,
        lastName: googleIdentity.lastName,
        passwordHash: null,
        isAnonymous: false,
        status: UserStatus.Active,
        credits: DEFAULT_SIGNUP_CREDITS,
      }),
    );
    expect(refreshRepo.save).toHaveBeenCalledTimes(1);
    expect(result.accessToken).toMatch(/^access-/);
    expect(result.refreshToken).toMatch(/^refresh-/);
  });

  it('signs in an existing Google-linked  user without overwriting names', async () => {
    const existing = makeUser({
      googleSub: googleIdentity.sub,
      firstName: 'Existing',
      lastName: 'Name',
    });
    userRepo.findOne.mockResolvedValueOnce(existing);

    await service.signInWithGoogle(
      { credential: 'google-token' },
      { ip: null, userAgent: null },
    );

    expect(userRepo.save).not.toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: googleIdentity.firstName,
        lastName: googleIdentity.lastName,
      }),
    );
    expect(refreshRepo.save).toHaveBeenCalledTimes(1);
  });

  it('auto-links an existing password user by verified Google email', async () => {
    const existing = makeUser({
      passwordHash: 'hash',
      firstName: 'Existing',
      lastName: null,
    });
    userRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existing);

    await service.signInWithGoogle(
      { credential: 'google-token' },
      { ip: null, userAgent: null },
    );

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: existing.id,
        googleSub: googleIdentity.sub,
        isAnonymous: false,
        firstName: 'Existing',
        lastName: googleIdentity.lastName,
      }),
    );
  });

  it('upgrades the current anonymous  user when no account matches', async () => {
    const anonymousUser = makeUser({
      id: 'anonymous-user-id',
      email: null,
      isAnonymous: true,
      anonymousData: {},
    });
    userRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    await service.signInWithGoogle(
      { credential: 'google-token', currentUser: anonymousUser },
      { ip: null, userAgent: null },
    );

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: anonymousUser.id,
        isAnonymous: false,
        anonymousData: null,
        email: googleIdentity.email,
        googleSub: googleIdentity.sub,
      }),
    );
  });

  it('signs into an existing email owner instead of merging anonymous data', async () => {
    const anonymousUser = makeUser({
      id: 'anonymous-user-id',
      email: null,
      isAnonymous: true,
    });
    const existing = makeUser({ id: 'registered-user-id' });
    userRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existing);

    await service.signInWithGoogle(
      { credential: 'google-token', currentUser: anonymousUser },
      { ip: null, userAgent: null },
    );

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: existing.id,
        googleSub: googleIdentity.sub,
      }),
    );
    expect(userRepo.save).not.toHaveBeenCalledWith(
      expect.objectContaining({
        id: anonymousUser.id,
      }),
    );
  });

  it('links Google when the current user email matches the verified Google email', async () => {
    const currentUser = makeUser({
      id: 'current-user-id',
      passwordHash: 'hash',
      googleSub: null,
      firstName: null,
      lastName: 'Existing',
    });
    userRepo.findOne
      .mockResolvedValueOnce(currentUser)
      .mockResolvedValueOnce(null);

    await service.linkGoogle(currentUser, 'google-token');

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: currentUser.id,
        googleSub: googleIdentity.sub,
        firstName: googleIdentity.firstName,
        lastName: 'Existing',
      }),
    );
    expect(refreshRepo.save).not.toHaveBeenCalled();
  });

  it('treats linking the same Google account as idempotent', async () => {
    const currentUser = makeUser({
      passwordHash: 'hash',
      googleSub: googleIdentity.sub,
    });
    userRepo.findOne.mockResolvedValueOnce(currentUser);

    await service.linkGoogle(currentUser, 'google-token');

    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('rejects linking a Google account with a different email', async () => {
    const currentUser = makeUser({
      email: 'other@example.com',
      passwordHash: 'hash',
    });
    userRepo.findOne.mockResolvedValueOnce(currentUser);

    await expect(
      service.linkGoogle(currentUser, 'google-token'),
    ).rejects.toMatchObject({
      code: 'CONFLICT',
    });

    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('rejects linking a Google account already attached to another user', async () => {
    const currentUser = makeUser({
      id: 'current-user-id',
      passwordHash: 'hash',
    });
    const owner = makeUser({
      id: 'other-user-id',
      googleSub: googleIdentity.sub,
    });
    userRepo.findOne
      .mockResolvedValueOnce(currentUser)
      .mockResolvedValueOnce(owner);

    await expect(
      service.linkGoogle(currentUser, 'google-token'),
    ).rejects.toMatchObject({
      code: 'CONFLICT',
    });

    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('rejects replacing an already linked Google account', async () => {
    const currentUser = makeUser({
      passwordHash: 'hash',
      googleSub: 'another-google-sub',
    });
    userRepo.findOne.mockResolvedValueOnce(currentUser);

    await expect(
      service.linkGoogle(currentUser, 'google-token'),
    ).rejects.toMatchObject({
      code: 'CONFLICT',
    });

    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('unlinks Google when password login exists', async () => {
    const currentUser = makeUser({
      passwordHash: 'hash',
      googleSub: googleIdentity.sub,
    });
    userRepo.findOne.mockResolvedValueOnce(currentUser);

    await service.unlinkGoogle(currentUser);

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: currentUser.id,
        googleSub: null,
      }),
    );
    expect(refreshRepo.save).not.toHaveBeenCalled();
  });

  it('treats unlinking absent Google as idempotent', async () => {
    const currentUser = makeUser({
      passwordHash: 'hash',
      googleSub: null,
    });
    userRepo.findOne.mockResolvedValueOnce(currentUser);

    await service.unlinkGoogle(currentUser);

    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('rejects unlinking Google when it is the last auth provider', async () => {
    const currentUser = makeUser({
      passwordHash: null,
      googleSub: googleIdentity.sub,
    });
    userRepo.findOne.mockResolvedValueOnce(currentUser);

    await expect(service.unlinkGoogle(currentUser)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    expect(userRepo.save).not.toHaveBeenCalled();
  });
});

describe('ProfileResponseDto auth providers', () => {
  it('maps email-only, Google-only, and linked provider flags', () => {
    expect(
      ProfileResponseDto.mapFromEntity(
        makeUser({ passwordHash: 'hash', googleSub: null }),
      ).authProviders,
    ).toEqual({
      [AuthProvider.Email]: true,
      [AuthProvider.Google]: false,
    });

    expect(
      ProfileResponseDto.mapFromEntity(
        makeUser({ passwordHash: null, googleSub: 'google-sub' }),
      ).authProviders,
    ).toEqual({
      [AuthProvider.Email]: false,
      [AuthProvider.Google]: true,
    });

    expect(
      ProfileResponseDto.mapFromEntity(
        makeUser({ passwordHash: 'hash', googleSub: 'google-sub' }),
      ).authProviders,
    ).toEqual({
      [AuthProvider.Email]: true,
      [AuthProvider.Google]: true,
    });
  });
});
