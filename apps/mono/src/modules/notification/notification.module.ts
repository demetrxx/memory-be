import { Module } from '@nestjs/common';

import { NotificationService } from './notification.service';
import { NotificationAdminService } from './notification-admin.service';

@Module({
  imports: [],
  providers: [NotificationService, NotificationAdminService],
  exports: [NotificationService, NotificationAdminService],
})
export class NotificationModule {}
