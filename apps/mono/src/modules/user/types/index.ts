import { PlanPeriod } from '@app/core';

export interface UserSubscription {
  isSubscribed: boolean;
  subscriptionPeriod: PlanPeriod;
}
