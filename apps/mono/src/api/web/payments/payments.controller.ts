import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ProtectedWeb, UserWeb } from '@/modules/auth';
import { PaymentService, PlanWebService } from '@/modules/payment';

import { PlansWebQuery, PlanWebDto } from './dtos';

@ApiTags('App / Payments')
@Controller()
export class PaymentsController {
  constructor(
    private readonly planService: PlanWebService,
    private readonly paymentService: PaymentService,
  ) {}

  @Get('plans')
  async getPlans(@Query() query: PlansWebQuery): Promise<PlanWebDto[]> {
    const plans = await this.planService.getActive(query);

    return plans.map((plan) => PlanWebDto.mapFromEntity(plan));
  }

  @Post('plans/:id')
  @ProtectedWeb()
  async createPayment(
    @UserWeb() user: UserWeb,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const invoice = await this.paymentService.createInvoice(user, id);
    await this.paymentService.confirmPayment(invoice.id);

    return { success: true };
  }
}
