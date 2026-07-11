import { Module } from '@nestjs/common';
import { minutes, ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from '@/modules/auth';

import { AuthController } from './auth.controller';

@Module({
  imports: [
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: minutes(1),
        limit: 3,
      },
    ]),
  ],
  controllers: [AuthController],
})
export class AuthApiModule {}
