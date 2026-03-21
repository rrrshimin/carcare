import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getCategoryById } from '@/services/api/category-api';
import { getLogTypeById, type LogTypeRow } from '@/services/api/log-type-api';
import { getLogsByVehicleAndLogType } from '@/services/api/user-log-api';
import { getDeviceByDeviceId, type UserDeviceRow } from '@/services/api/device-api';
import { getVehicleByDeviceId, getVehicleById, type VehicleRow } from '@/services/api/vehicle-api';
import { getDeviceId } from '@/services/storage-service';
import { getVehicleStore } from '@/store/vehicle-store';
import { getCurrencySymbol, DEFAULT_CURRENCY_CODE } from '@/services/currency-service';
import { loadCachedCurrencyCode } from '@/hooks/use-currency';
import {
  getMaintenanceHistory,
  type MaintenanceHistoryViewModel,
} from '@/features/maintenance/get-maintenance-history';

type UseMaintenanceHistoryResult = {
  data: MaintenanceHistoryViewModel | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  retry: () => void;
};

export function useMaintenanceHistory(logTypeId: number): UseMaintenanceHistoryResult {
  const [data, setData] = useState<MaintenanceHistoryViewModel | null>(null);
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
            setError('Device identity not found.');
            return;
          }

          const { activeVehicleId } = getVehicleStore();

          const [vehicle, device, logType] = await Promise.all([
            activeVehicleId
              ? getVehicleById(activeVehicleId, deviceId)
              : getVehicleByDeviceId(deviceId),
            getDeviceByDeviceId(deviceId),
            getLogTypeById(logTypeId),
          ]);

          if (cancelled) return;

          if (!vehicle || !device) {
            setError('Vehicle not found.');
            return;
          }

          if (!logType) {
            setError('Maintenance item not found.');
            return;
          }

          const [logs, category, cachedCurrency] = await Promise.all([
            getLogsByVehicleAndLogType(vehicle.id, logTypeId, deviceId),
            logType.category_link
              ? getCategoryById(logType.category_link)
              : Promise.resolve(null),
            loadCachedCurrencyCode(),
          ]);
          if (cancelled) return;

          const currencyCode = device.currency_code ?? cachedCurrency;
          const currencySymbol = getCurrencySymbol(currencyCode);

          const viewModel = getMaintenanceHistory(
            logType,
            logs,
            vehicle.id,
            vehicle.current_odometer ?? 0,
            vehicle.fuel_type,
            device.unit ?? 'km',
            category?.image_url ?? null,
            currencySymbol,
          );

          setData(viewModel);
          hasLoadedRef.current = true;
        } catch (e) {
          if (!cancelled) {
            setError(
              e instanceof Error ? e.message : 'Failed to load maintenance history.',
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
    }, [logTypeId, retryKey]),
  );

  return { data, loading, refreshing, error, retry };
}
