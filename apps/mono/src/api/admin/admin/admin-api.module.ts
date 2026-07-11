import { Module } from '@nestjs/common';

import { AdminModule } from '@/modules/admin';
import { AuthModule } from '@/modules/auth';

import { AdminAppController } from './admin.controller';

@Module({
  imports: [AuthModule, AdminModule],
  controllers: [AdminAppController],
})
export class AdminApiModule {}
