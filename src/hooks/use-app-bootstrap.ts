import { useEffect, useState } from 'react';

import { ensureDeviceIdentity } from '@/services/device-identity-service';
import { getOnboardingCompleted } from '@/services/storage-service';
import { vehicleExistsForDevice } from '@/services/vehicle-service';
import { setAppState } from '@/store/app-store';

export type BootstrapResult = {
  isReady: boolean;
  deviceId: string | null;
  onboardingCompleted: boolean;
  vehicleExists: boolean;
  error: string | null;
};

/**
 * Initialises device identity, checks onboarding state, and verifies
 * vehicle existence against the backend (not just local cache).
 */
export function useAppBootstrap(): BootstrapResult {
  const [result, setResult] = useState<BootstrapResult>({
    isReady: false,
    deviceId: null,
    onboardingCompleted: false,
    vehicleExists: false,
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

        const vehicleExists = await vehicleExistsForDevice(deviceId);

        if (cancelled) return;

        setResult({
          isReady: true,
          deviceId,
          onboardingCompleted,
          vehicleExists,
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
