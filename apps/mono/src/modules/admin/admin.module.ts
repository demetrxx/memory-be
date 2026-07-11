import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';

import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
