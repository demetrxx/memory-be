import { Module } from '@nestjs/common';

import { LogsService } from './logs.service';
import { LogsAdminService } from './logs-admin.service';

@Module({
  providers: [LogsAdminService, LogsService],
  exports: [LogsAdminService, LogsService],
})
export class LogsModule {}
