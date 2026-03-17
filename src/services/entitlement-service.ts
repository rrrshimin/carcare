import type { SubscriptionPlan } from '@/types/entitlement';

const CAR_LIMITS: Record<SubscriptionPlan, number> = {
  free: 1,
  base: 3,
  pro: Infinity,
};

export function getPlanCarLimit(plan: SubscriptionPlan): number {
  return CAR_LIMITS[plan] ?? 1;
}

export function canAddVehicle(plan: SubscriptionPlan, currentCount: number): boolean {
  return currentCount < getPlanCarLimit(plan);
}

export function normalizePlan(raw: string | null | undefined): SubscriptionPlan {
  if (raw === 'base' || raw === 'pro') return raw;
  return 'free';
}

export function getPlanDisplayName(plan: SubscriptionPlan): string {
  switch (plan) {
    case 'base':
      return 'Base';
    case 'pro':
      return 'Pro';
    default:
      return 'Free';
  }
}
