import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { PaymentModule } from '@/modules/payment';

import { PlansController } from './plans.controller';

@Module({
  imports: [AuthModule, PaymentModule],
  controllers: [PlansController],
})
export class PlansApiModule {}
