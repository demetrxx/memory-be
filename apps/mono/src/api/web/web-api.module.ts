import { Module } from '@nestjs/common';

import { AuthApiModule } from './auth';
import { NotificationsApiModule } from './notifications';
import { PaymentsApiModule } from './payments';
import { ProfileApiModule } from './profile';

@Module({
  imports: [
    AuthApiModule,
    PaymentsApiModule,
    ProfileApiModule,
    NotificationsApiModule,
  ],
  controllers: [],
})
export class WebApiModule {}
