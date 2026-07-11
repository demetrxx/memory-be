import { PlanPeriod, SubscriptionEntity } from '@app/core';

export function getSubscriptionTotalPriceCents(
  period: PlanPeriod,
  monthlyPriceCents: number,
) {
  switch (period) {
    case PlanPeriod.Month:
      return monthlyPriceCents;
    case PlanPeriod.Quarter:
      return monthlyPriceCents * 3;
    case PlanPeriod.Year:
      return monthlyPriceCents * 12;
  }
}

export function getSubscriptionEndDate(
  period: PlanPeriod,
  subscription?: SubscriptionEntity,
) {
  let date = new Date();

  // extend same type subscription if exists and not expired
  if (subscription?.period === period && subscription.endDate > date) {
    date = subscription.endDate;
  }

  switch (period) {
    case PlanPeriod.Month:
      date.setMonth(date.getMonth() + 1);
      break;
    case PlanPeriod.Quarter:
      date.setMonth(date.getMonth() + 3);
      break;
    case PlanPeriod.Year:
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
