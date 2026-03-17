export type SubscriptionPlan = 'free' | 'base' | 'pro';

export type EntitlementState = {
  plan: SubscriptionPlan;
  maxCars: number;
  canAddCar: boolean;
};
