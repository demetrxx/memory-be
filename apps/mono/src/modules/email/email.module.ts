import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailConfig } from '@/config';

import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule.forFeature(EmailConfig)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
