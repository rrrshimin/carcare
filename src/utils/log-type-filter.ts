import type { LogTypeRow } from '@/services/api/log-type-api';

/**
 * Returns true when a log type is applicable to the given vehicle.
 *
 * Rules:
 * - If applicable_fuel_types is null → no restriction → include
 * - If applicable_fuel_types is an array → include only if fuelType is in it
 * - Same logic for applicable_transmissions
 * - If the vehicle's fuelType or transmission is null → skip that check → include
 */
export function isLogTypeApplicableToVehicle(
  logType: LogTypeRow,
  fuelType: string | null,
  transmission: string | null,
): boolean {
  if (
    fuelType !== null &&
    logType.applicable_fuel_types !== null &&
    logType.applicable_fuel_types !== undefined
  ) {
    if (!logType.applicable_fuel_types.includes(fuelType)) return false;
  }
  if (
    transmission !== null &&
    logType.applicable_transmissions !== null &&
    logType.applicable_transmissions !== undefined
  ) {
    if (!logType.applicable_transmissions.includes(transmission)) return false;
  }
  return true;
}
