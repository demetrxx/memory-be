import { RouteTree } from '@nestjs/core';

import { AdminApiModule } from './admin';
import { AuthApiModule } from './auth';
import { FilesApiModule } from './files';
import { LogsApiModule } from './logs';
import { PlansApiModule } from './plans';
import { UsersApiModule } from './users';

const routes: [string, any][] = [
  ['files', FilesApiModule],
  ['admins', AdminApiModule],
  ['logs', LogsApiModule],
  ['users', UsersApiModule],
  ['plans', PlansApiModule],
  ['auth', AuthApiModule],
];

export const adminApiRoutes: RouteTree = {
  path: '/admin',
  children: routes.map(([path, module]) => ({ path, module })),
};
