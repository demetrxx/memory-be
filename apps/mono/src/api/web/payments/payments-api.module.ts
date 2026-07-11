import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { PaymentModule } from '@/modules/payment';

import { PaymentsController } from './payments.controller';

@Module({
  imports: [PaymentModule, AuthModule],
  controllers: [PaymentsController],
  providers: [],
})
export class PaymentsApiModule {}
