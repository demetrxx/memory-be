import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { UserModule } from '@/modules/user';

import { ProfileController } from './profile.controller';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [ProfileController],
})
export class ProfileApiModule {}
