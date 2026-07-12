import { Module } from '@nestjs/common';

import { AuthApiModule } from './auth';
import { FilesApiModule } from './files';
import { NotificationsApiModule } from './notifications';
import { PaymentsApiModule } from './payments';
import { ProfileApiModule } from './profile';
import { SettlementsApiModule } from './settlements';

@Module({
  imports: [
    AuthApiModule,
    PaymentsApiModule,
    ProfileApiModule,
    NotificationsApiModule,
    SettlementsApiModule,
    FilesApiModule,
  ],
  controllers: [],
})
export class WebApiModule {}
