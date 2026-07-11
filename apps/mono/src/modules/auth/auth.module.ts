import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { EmailModule } from '@/modules/email';

import { AuthAdminService } from './auth-admin.service';
import { AuthWebService } from './auth-web.service';
import { GoogleIdentityService } from './google-identity.service';
import { AuthAdminGuard, AuthWebGuard } from './guards';
import { OtpService } from './otp.service';

@Module({
  imports: [JwtModule.register({}), EmailModule],
  providers: [
    AuthAdminGuard,
    AuthWebGuard,
    AuthAdminService,
    AuthWebService,
    GoogleIdentityService,
    OtpService,
  ],
  exports: [
    AuthAdminGuard,
    AuthWebGuard,
    AuthAdminService,
    AuthWebService,
    JwtModule,
  ],
})
export class AuthModule {}
