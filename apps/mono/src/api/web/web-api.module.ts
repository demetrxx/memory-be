import { Module } from '@nestjs/common';

import { AuthApiModule } from './auth';
import { DeceasedApiModule } from './deceased';
import { FilesApiModule } from './files';
import { MapApiModule } from './map';
import { MilitaryUnitsApiModule } from './military-units';
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
    DeceasedApiModule,
    MilitaryUnitsApiModule,
    MapApiModule,
  ],
  controllers: [],
})
export class WebApiModule {}
