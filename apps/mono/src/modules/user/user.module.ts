import { Module } from '@nestjs/common';

import { UserWebService } from './user.service';
import { UserAdminService } from './user-admin.service';

@Module({
  imports: [],
  providers: [UserWebService, UserAdminService],
  exports: [UserWebService, UserAdminService],
})
export class UserModule {}
