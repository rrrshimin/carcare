import { WARNING_DISTANCE } from '@/constants/maintenance-thresholds';
import type { LogTypeRow } from '@/services/api/log-type-api';
import type { UserLogRow } from '@/services/api/user-log-api';
import type { MaintenanceItemStatus } from '@/types/maintenance';
import type { DistanceUnit } from '@/types/vehicle';
import { convertDistance } from './convert-distance';
import { getMileageDueStatus, getTimeDueStatus, type DueCalculation } from './get-due-status';
import { getEffectiveDueInterval } from './get-effective-due-interval';

const NEUTRAL_STATUS: MaintenanceItemStatus = {
  variant: 'neutral',
  label: 'No logs yet',
};

/**
 * Computes due-status for a single maintenance item given its latest log.
 * Returns null when there is no meaningful calculation (no log, bad interval).
 * Consumers should fall back to NEUTRAL_STATUS when null is returned.
 *
 * For mileage-based items the seeded interval (always in km) and the
 * warning threshold are converted into the active unit so the calculation
 * operates in the same unit as user-entered odometer values.
 */
export function computeDueStatus(
  logType: LogTypeRow,
  latestLog: UserLogRow | null,
  currentOdometer: number,
  fuelType: string | null,
  unit: string,
): DueCalculation | null {
  if (!latestLog) return null;

  const effectiveDue = getEffectiveDueInterval(logType, fuelType);
  if (effectiveDue <= 0) {
    return { status: { variant: 'normal', label: '' }, remaining: 0 };
  }

  if (logType.due_type === 'time') {
    if (!latestLog.change_date) return null;
    return getTimeDueStatus(latestLog.change_date, effectiveDue);
  }

  if (latestLog.odo_log == null) return null;

  const distanceUnit = (unit === 'mi' ? 'mi' : 'km') as DistanceUnit;
  const convertedDue = convertDistance(effectiveDue, distanceUnit);
  const convertedThreshold = convertDistance(WARNING_DISTANCE, distanceUnit);

  return getMileageDueStatus(
    currentOdometer,
    latestLog.odo_log,
    convertedDue,
    unit,
    convertedThreshold,
  );
}

export { NEUTRAL_STATUS };
