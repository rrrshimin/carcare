import type { LogTypeRow } from '@/services/api/log-type-api';
import type { UserLogRow } from '@/services/api/user-log-api';
import type { VehicleRow } from '@/services/api/vehicle-api';
import { computeDueStatus } from '@/utils/calculations/compute-due-status';
import { getLatestLog } from '@/utils/calculations/get-latest-log';

/**
 * Counts the number of warning + overdue maintenance items for a vehicle.
 * Used by the garage screen to display a danger badge and sort vehicles.
 */
export function getVehicleDangerCount(
  vehicle: VehicleRow,
  logTypes: LogTypeRow[],
  userLogs: UserLogRow[],
  unit: string,
): number {
  const fuelType = vehicle.fuel_type;
  const currentOdometer = vehicle.current_odometer ?? 0;
  let count = 0;

  for (const logType of logTypes) {
    const sortBy = logType.due_type === 'time' ? 'date' : ('mileage' as const);
    const latestLog = getLatestLog(userLogs, logType.id, vehicle.id, sortBy);
    const result = computeDueStatus(logType, latestLog, currentOdometer, fuelType, unit);

    if (result && (result.status.variant === 'warning' || result.status.variant === 'overdue')) {
      count++;
    }
  }

  return count;
}
