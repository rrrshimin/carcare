import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import type { VehicleRow } from '@/services/api/vehicle-api';
import { getCurrentVehicle } from '@/services/vehicle-service';

export function useVehicle() {
  const [vehicle, setVehicle] = useState<VehicleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      setLoading(true);
      setError(null);
      getCurrentVehicle()
        .then((v) => {
          if (!cancelled) setVehicle(v);
        })
        .catch((e) => {
          if (!cancelled) {
            setError(e instanceof Error ? e : new Error('Failed to load vehicle'));
            setVehicle(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  return { vehicle, loading, error };
}
