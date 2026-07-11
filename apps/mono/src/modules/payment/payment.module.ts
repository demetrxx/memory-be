import { Module } from '@nestjs/common';

import { PaymentService } from './payment-web.service';
import { PlanWebService } from './plan.service';
import { PlanAdminService } from './plan-admin.service';

@Module({
  providers: [PlanWebService, PaymentService, PlanAdminService],
  exports: [PlanWebService, PaymentService, PlanAdminService],
})
export class PaymentModule {}
