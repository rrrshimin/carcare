import type { LogTypeRow } from '@/services/api/log-type-api';
import type { UserLogRow } from '@/services/api/user-log-api';
import type { MaintenanceItemStatus } from '@/types/maintenance';
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
  if (effectiveDue <= 0) return null;

  if (logType.due_type === 'time') {
    if (!latestLog.change_date) return null;
    return getTimeDueStatus(latestLog.change_date, effectiveDue);
  }

  if (latestLog.odo_log == null) return null;
  return getMileageDueStatus(currentOdometer, latestLog.odo_log, effectiveDue, unit);
}

export { NEUTRAL_STATUS };
