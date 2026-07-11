import type { UserEntity } from '@app/core';
import type { FastifyRequest } from 'fastify';

export type AppAuthenticatedFastifyRequest = FastifyRequest & {
  appUser: UserEntity;
};
