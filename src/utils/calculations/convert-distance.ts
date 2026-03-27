/*
 * KM-CANONICAL UNIT RULE
 *
 * All distance-based intervals and thresholds in the database and
 * constants are stored in KILOMETERS.  User-entered odometer and
 * odo_log values are stored in the user's selected unit (km or mi).
 *
 * Before comparing a canonical-km value against user-unit values,
 * it MUST be converted through convertDistance().
 *
 * Canonical-km values:
 *   - log_types.base_due  (via getEffectiveDueInterval)
 *   - WARNING_DISTANCE            (maintenance-thresholds.ts)
 *   - MILEAGE_DUE_TIER1_THRESHOLD (notification-config.ts)
 *   - MILEAGE_DUE_TIER2_THRESHOLD (notification-config.ts)
 */
import type { DistanceUnit } from '@/types/vehicle';

export const KM_TO_MI = 0.621371;

/**
 * Converts a canonical km-based distance value into the target unit.
 * Returns the value unchanged when target is 'km'.
 */
export function convertDistance(valueInKm: number, unit: DistanceUnit): number {
  if (unit === 'mi') return Math.round(valueInKm * KM_TO_MI);
  return valueInKm;
}
