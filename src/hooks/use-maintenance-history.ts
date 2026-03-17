import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getCategoryById } from '@/services/api/category-api';
import { getLogTypeById, type LogTypeRow } from '@/services/api/log-type-api';
import { getLogsByVehicleAndLogType } from '@/services/api/user-log-api';
import { getDeviceByDeviceId, type UserDeviceRow } from '@/services/api/device-api';
import { getVehicleByDeviceId, getVehicleById, type VehicleRow } from '@/services/api/vehicle-api';
import { getDeviceId } from '@/services/storage-service';
import { getVehicleStore } from '@/store/vehicle-store';
import {
  getMaintenanceHistory,
  type MaintenanceHistoryViewModel,
} from '@/features/maintenance/get-maintenance-history';

type UseMaintenanceHistoryResult = {
  data: MaintenanceHistoryViewModel | null;
  loading: boolean;
  error: string | null;
};

export function useMaintenanceHistory(logTypeId: number): UseMaintenanceHistoryResult {
  const [data, setData] = useState<MaintenanceHistoryViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        try {
          setLoading(true);
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

          const [logs, category] = await Promise.all([
            getLogsByVehicleAndLogType(vehicle.id, logTypeId, deviceId),
            logType.category_link
              ? getCategoryById(logType.category_link)
              : Promise.resolve(null),
          ]);
          if (cancelled) return;

          const viewModel = getMaintenanceHistory(
            logType,
            logs,
            vehicle.id,
            vehicle.current_odometer ?? 0,
            vehicle.fuel_type,
            device.unit ?? 'km',
            category?.image_url ?? null,
          );

          setData(viewModel);
        } catch (e) {
          if (!cancelled) {
            setError(
              e instanceof Error ? e.message : 'Failed to load maintenance history.',
            );
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();

      return () => {
        cancelled = true;
      };
    }, [logTypeId]),
  );

  return { data, loading, error };
}
