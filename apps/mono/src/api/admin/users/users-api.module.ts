import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { UserModule } from '@/modules/user';

import { UsersController } from './users.controller';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [UsersController],
})
export class UsersApiModule {}
