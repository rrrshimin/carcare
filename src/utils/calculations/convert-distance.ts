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
