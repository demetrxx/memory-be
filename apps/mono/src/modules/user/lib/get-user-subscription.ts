import { SubscriptionEntity } from '@app/core';

import { UserSubscription } from '../types';

export function getUserSubscription(
  subscription?: SubscriptionEntity,
): UserSubscription {
  if (!subscription) {
    return {
      isSubscribed: false,
      subscriptionPeriod: null,
    };
  }

  return {
    isSubscribed: subscription.endDate > new Date(),
    subscriptionPeriod: subscription.period,
  };
}
