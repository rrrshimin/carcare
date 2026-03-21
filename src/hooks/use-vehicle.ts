import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import type { VehicleRow } from '@/services/api/vehicle-api';
import { getActiveVehicle } from '@/services/vehicle-service';

export function useVehicle() {
  const [vehicle, setVehicle] = useState<VehicleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      if (!hasLoadedRef.current) setLoading(true);
      setError(null);
      getActiveVehicle()
        .then((v) => {
          if (!cancelled) {
            setVehicle(v);
            hasLoadedRef.current = true;
          }
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
