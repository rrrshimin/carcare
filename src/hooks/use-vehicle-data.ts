import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getAllCategories, type LogCategoryRow } from '@/services/api/category-api';
import { getDeviceByDeviceId, type UserDeviceRow } from '@/services/api/device-api';
import { getAllLogTypes, type LogTypeRow } from '@/services/api/log-type-api';
import { getLogsByVehicleId, type UserLogRow } from '@/services/api/user-log-api';
import { getVehicleByDeviceId, getVehicleById, type VehicleRow } from '@/services/api/vehicle-api';
import { getDeviceId } from '@/services/storage-service';
import { getVehicleStore } from '@/store/vehicle-store';

export type VehicleScreenData = {
  vehicle: VehicleRow;
  device: UserDeviceRow;
  categories: LogCategoryRow[];
  logTypes: LogTypeRow[];
  userLogs: UserLogRow[];
};

type UseVehicleDataResult = {
  data: VehicleScreenData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  retry: () => void;
};

export function useVehicleData(): UseVehicleDataResult {
  const [data, setData] = useState<VehicleScreenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const [retryKey, setRetryKey] = useState(0);

  const retry = useCallback(() => {
    hasLoadedRef.current = false;
    setRetryKey((k) => k + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        try {
          if (hasLoadedRef.current) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }
          setError(null);

          const deviceId = await getDeviceId();
          if (!deviceId) {
            setData(null);
            return;
          }

          const { activeVehicleId } = getVehicleStore();

          const [vehicle, device, categories, logTypes] = await Promise.all([
            activeVehicleId
              ? getVehicleById(activeVehicleId, deviceId)
              : getVehicleByDeviceId(deviceId),
            getDeviceByDeviceId(deviceId),
            getAllCategories(),
            getAllLogTypes(),
          ]);

          if (cancelled) return;

          if (!vehicle || !device) {
            setData(null);
            return;
          }

          const userLogs = await getLogsByVehicleId(vehicle.id, deviceId);
          if (cancelled) return;

          setData({ vehicle, device, categories, logTypes, userLogs });
          hasLoadedRef.current = true;
        } catch (e) {
          if (!cancelled) {
            setError(
              e instanceof Error ? e.message : 'Failed to load vehicle data',
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      }

      load();

      return () => {
        cancelled = true;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [retryKey]),
  );

  return { data, loading, refreshing, error, retry };
}
