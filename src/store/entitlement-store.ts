import type { SubscriptionPlan } from '@/types/entitlement';

type EntitlementStoreState = {
  plan: SubscriptionPlan;
};

let state: EntitlementStoreState = {
  plan: 'free',
};

export function getEntitlementStore(): Readonly<EntitlementStoreState> {
  return state;
}

export function setPlan(plan: SubscriptionPlan): void {
  state = { ...state, plan };
}

export function resetEntitlementStore(): void {
  state = { plan: 'free' };
}
