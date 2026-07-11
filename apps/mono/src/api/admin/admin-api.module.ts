import { Module } from '@nestjs/common';

import { AdminApiModule as AdminUserApiModule } from './admin';
import { AuthApiModule } from './auth';
import { FilesApiModule } from './files';
import { LogsApiModule } from './logs';
import { PlansApiModule } from './plans';
import { UsersApiModule } from './users';

@Module({
  imports: [
    FilesApiModule,
    AdminUserApiModule,
    LogsApiModule,
    UsersApiModule,
    PlansApiModule,
    AuthApiModule,
  ],
  controllers: [],
})
export class AdminApiModule {}
