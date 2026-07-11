import { AdminEntity } from '@app/core';
import { type FastifyRequest } from 'fastify';

import { UserWeb } from '../decorators';

export type AuthenticatedAdminFastifyRequest = FastifyRequest & {
  token: string;
  user: AdminEntity;
};

export type AuthenticatedUserWebFastifyRequest = FastifyRequest & {
  token: string;
  user: UserWeb;
};
