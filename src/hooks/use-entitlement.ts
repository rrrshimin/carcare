import { useCallback, useMemo } from 'react';

import { getDeviceByDeviceId } from '@/services/api/device-api';
import { canAddVehicle, normalizePlan } from '@/services/entitlement-service';
import { getDeviceId } from '@/services/storage-service';
import { useEntitlementStore, setPlan } from '@/store/entitlement-store';
import { getVehicleStore } from '@/store/vehicle-store';
import type { SubscriptionPlan } from '@/types/entitlement';

/**
 * Fetches the device's subscription_status from the backend and updates
 * the entitlement store.  Returns the normalised plan.
 */
export async function loadEntitlement(): Promise<SubscriptionPlan> {
  const deviceId = await getDeviceId();
  if (!deviceId) {
    setPlan('free');
    return 'free';
  }

  const device = await getDeviceByDeviceId(deviceId);
  const plan = normalizePlan(device?.subscription_status);
  setPlan(plan);
  return plan;
}

/**
 * Reads the current entitlement reactively from the store and derives
 * whether the user can add another car.
 */
export function useEntitlement() {
  const { plan } = useEntitlementStore();
  const vehicleCount = getVehicleStore().vehicleCount;

  const canAddCar = useMemo(
    () => canAddVehicle(plan, vehicleCount),
    [plan, vehicleCount],
  );

  const refresh = useCallback(async () => {
    await loadEntitlement();
  }, []);

  return { plan, canAddCar, refresh };
}
