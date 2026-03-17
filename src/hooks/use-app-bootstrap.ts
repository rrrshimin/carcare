import { useEffect, useState } from 'react';

import { ensureDeviceIdentity } from '@/services/device-identity-service';
import { loadEntitlement } from '@/hooks/use-entitlement';
import { getOnboardingCompleted } from '@/services/storage-service';
import { getVehicleCountForDevice } from '@/services/vehicle-service';
import { setAppState } from '@/store/app-store';

export type BootstrapResult = {
  isReady: boolean;
  deviceId: string | null;
  onboardingCompleted: boolean;
  vehicleExists: boolean;
  vehicleCount: number;
  error: string | null;
};

/**
 * Initialises device identity, checks onboarding state, and verifies
 * vehicle existence against the backend (not just local cache).
 * Returns vehicleCount so the splash can decide between Garage and Home.
 */
export function useAppBootstrap(): BootstrapResult {
  const [result, setResult] = useState<BootstrapResult>({
    isReady: false,
    deviceId: null,
    onboardingCompleted: false,
    vehicleExists: false,
    vehicleCount: 0,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [deviceId, onboardingCompleted] = await Promise.all([
          ensureDeviceIdentity(),
          getOnboardingCompleted(),
        ]);

        if (cancelled) return;

        setAppState({ deviceId, onboardingCompleted });

        const [vehicleCount] = await Promise.all([
          getVehicleCountForDevice(deviceId),
          loadEntitlement(),
        ]);

        if (cancelled) return;

        setResult({
          isReady: true,
          deviceId,
          onboardingCompleted,
          vehicleExists: vehicleCount > 0,
          vehicleCount,
          error: null,
        });
      } catch (e) {
        if (cancelled) return;

        const message =
          e instanceof Error ? e.message : 'Failed to initialize app';
        setResult((prev) => ({ ...prev, isReady: true, error: message }));
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
