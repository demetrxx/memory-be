import {
  InvoiceEntity,
  InvoiceStatus,
  PaymentEntity,
  PlanEntity,
  PlanType,
  SubscriptionEntity,
  UserEntity,
} from '@app/core';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';

import { getSubscriptionEndDate } from './lib';

// const RECHARGE_TIME_BUFFER = 6 * 60 * 60 * 1000; // 6 hours

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createInvoice(user: UserEntity, planId: string) {
    const plan = await this.dataSource.getRepository(PlanEntity).findOne({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      this.logger.error({
        service: 'payment-web',
        action: 'create-invoice',
        error: 'Plan not found',
        details: {
          planId,
        },
      });
      throw Err.notFound('Plan not found');
    }

    const invoiceRepository = this.dataSource.getRepository(InvoiceEntity);
    const invoice = await invoiceRepository.save({
      userId: user.id,
      planId,
      amountCents: plan.amountCents,
    });

    return invoice;
  }

  async confirmPayment(invoiceId: string) {
    const invoice = await this.dataSource.getRepository(InvoiceEntity).findOne({
      where: {
        id: invoiceId,
      },
      relations: ['plan', 'user', 'user.subscription'],
    });

    const { user, plan } = invoice;

    if (!invoice) {
      this.logger.error({
        service: 'payment-web',
        action: 'create-payment',
        error: 'Invoice is not found',
        details: {
          invoiceId,
        },
      });
      throw Err.internal('Invoice is not found');
    }

    if (invoice.status !== InvoiceStatus.Pending) {
      this.logger.error({
        service: 'payment-web',
        action: 'create-payment',
        error: 'Invoice is not pending',
        details: {
          invoiceId,
        },
      });
      throw Err.internal('Invoice is not pending');
    }

    await this.dataSource.transaction(async (ds) => {
      const payment = await ds.getRepository(PaymentEntity).save({
        userId: user.id,
        amountCents: plan.amountCents,
        planId: plan.id,
        invoiceId: invoice.id,
      });

      await ds.getRepository(InvoiceEntity).update(invoice.id, {
        status: InvoiceStatus.Paid,
      });

      return payment;
    });

    switch (plan.type) {
      case PlanType.Subscription:
        await this.dataSource.getRepository(SubscriptionEntity).save({
          id: user.subscription?.id,
          userId: user.id,
          period: plan.period,
          endDate: getSubscriptionEndDate(plan.period, user.subscription),
        });
        break;
      case PlanType.Service:
        break;
    }
  }

  async failPayment(invoiceId: string) {
    const invoice = await this.dataSource.getRepository(InvoiceEntity).findOne({
      where: {
        id: invoiceId,
      },
    });

    if (!invoice) {
      this.logger.error({
        service: 'payment-web',
        action: 'fail-payment',
        error: 'Invoice is not found',
        details: {
          invoiceId,
        },
      });

      throw Err.notFound('Invoice is not found');
    }

    await this.dataSource.getRepository(InvoiceEntity).update(invoice.id, {
      status: InvoiceStatus.Failed,
    });
  }
}
