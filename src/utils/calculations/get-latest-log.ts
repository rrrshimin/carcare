import type { UserLogRow } from '@/services/api/user-log-api';

/**
 * Finds the most recent user_log for a given log type and vehicle.
 * Primary sort: change_date descending.
 * Tie-breaker: created_at descending (per business-logic.md §5).
 */
export function getLatestLog(
  logs: UserLogRow[],
  logTypeId: number,
  carId: number,
): UserLogRow | null {
  const matching = logs.filter(
    (log) => log.log_type === logTypeId && log.car_id === carId,
  );

  if (matching.length === 0) return null;

  matching.sort((a, b) => {
    const dateA = a.change_date ?? '';
    const dateB = b.change_date ?? '';
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return b.created_at.localeCompare(a.created_at);
  });

  return matching[0];
}
