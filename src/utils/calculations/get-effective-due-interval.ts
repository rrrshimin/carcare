import type { LogTypeRow } from '@/services/api/log-type-api';

/**
 * Applies fuel-type multiplier to base_due per business-logic.md §4.
 * Petrol/Electric → base_due × 1
 * Diesel          → base_due × diesel_increment
 * Hybrid          → base_due × hybrid_increment
 * Missing or invalid multipliers default to 1.
 */
export function getEffectiveDueInterval(
  logType: LogTypeRow,
  fuelType: string | null,
): number {
  const baseDue = logType.base_due ?? 0;
  if (baseDue <= 0) return 0;

  let multiplier = 1;

  switch (fuelType?.toLowerCase()) {
    case 'diesel':
      multiplier = logType.diesel_increment ?? 1;
      break;
    case 'hybrid':
      multiplier = logType.hybrid_increment ?? 1;
      break;
  }

  if (multiplier <= 0) multiplier = 1;

  return Math.round(baseDue * multiplier);
}
