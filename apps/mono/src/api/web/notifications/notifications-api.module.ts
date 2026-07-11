import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { NotificationModule } from '@/modules/notification';

import { NotificationsController } from './notifications.controller';

@Module({
  imports: [NotificationModule, AuthModule],
  controllers: [NotificationsController],
  providers: [],
})
export class NotificationsApiModule {}
