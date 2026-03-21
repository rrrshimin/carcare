import { useSyncExternalStore } from 'react';
import type { SubscriptionPlan } from '@/types/entitlement';

type EntitlementStoreState = {
  plan: SubscriptionPlan;
};

let state: EntitlementStoreState = {
  plan: 'free',
};

let listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): EntitlementStoreState {
  return state;
}

export function getEntitlementStore(): Readonly<EntitlementStoreState> {
  return state;
}

export function useEntitlementStore(): Readonly<EntitlementStoreState> {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function setPlan(plan: SubscriptionPlan): void {
  state = { ...state, plan };
  emitChange();
}

export function resetEntitlementStore(): void {
  state = { plan: 'free' };
  emitChange();
}
