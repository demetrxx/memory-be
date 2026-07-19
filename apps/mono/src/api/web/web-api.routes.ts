import { RouteTree } from '@nestjs/core';

import { AuthApiModule } from './auth';
import { DeceasedApiModule } from './deceased';
import { FilesApiModule } from './files';
import { MapApiModule } from './map';
import { MilitaryUnitsApiModule } from './military-units';
import { NotificationsApiModule } from './notifications';
import { PaymentsApiModule } from './payments';
import { ProfileApiModule } from './profile';
import { SettlementsApiModule } from './settlements';

export const webApiRoutes: RouteTree = {
  path: '/web',
  children: [
    {
      path: 'payments',
      module: PaymentsApiModule,
    },
    {
      path: 'notifications',
      module: NotificationsApiModule,
    },
    {
      path: 'auth',
      module: AuthApiModule,
    },
    {
      path: 'profile',
      module: ProfileApiModule,
    },
    {
      path: 'settlements',
      module: SettlementsApiModule,
    },
    {
      path: 'files',
      module: FilesApiModule,
    },

    {
      path: 'deceased',
      module: DeceasedApiModule,
    },
    {
      path: 'military-units',
      module: MilitaryUnitsApiModule,
    },
    {
      path: 'map',
      module: MapApiModule,
    },
  ],
};
