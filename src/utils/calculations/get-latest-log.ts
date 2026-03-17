import type { UserLogRow } from '@/services/api/user-log-api';

/**
 * Finds the most relevant user_log for a given log type and vehicle.
 *
 * sortBy = 'date' (default, for time-based items):
 *   Primary sort: change_date descending.
 *   Tie-breaker: created_at descending (per business-logic.md §5).
 *
 * sortBy = 'mileage' (for mileage-based items):
 *   Primary sort: odo_log descending (highest recorded mileage = most recent service).
 */
export function getLatestLog(
  logs: UserLogRow[],
  logTypeId: number,
  carId: number,
  sortBy: 'date' | 'mileage' = 'date',
): UserLogRow | null {
  const matching = logs.filter(
    (log) => log.log_type === logTypeId && log.car_id === carId,
  );

  if (matching.length === 0) return null;

  if (sortBy === 'mileage') {
    matching.sort((a, b) => (b.odo_log ?? 0) - (a.odo_log ?? 0));
  } else {
    matching.sort((a, b) => {
      const dateA = a.change_date ?? '';
      const dateB = b.change_date ?? '';
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return b.created_at.localeCompare(a.created_at);
    });
  }

  return matching[0];
}
