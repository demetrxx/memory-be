import { Module } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';

import { AdminApiModule, adminApiRoutes } from './admin';
import { InternalApiModule, internalApiRoutes } from './internal';
import { RootController } from './root.controller';
import { WebApiModule, webApiRoutes } from './web';

const ROUTES: Routes = [adminApiRoutes, internalApiRoutes, webApiRoutes];

@Module({
  imports: [
    AdminApiModule,
    InternalApiModule,
    RouterModule.register(ROUTES),
    WebApiModule,
  ],
  controllers: [RootController],
})
export class ApiModule {}
