import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { LogsModule } from '@/modules/logs';

import { LogsController } from './logs.controller';

@Module({
  imports: [AuthModule, LogsModule],
  controllers: [LogsController],
})
export class LogsApiModule {}
