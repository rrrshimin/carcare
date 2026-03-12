/**
 * Formats a numeric mileage value with locale-aware thousand separators.
 * Optionally appends the distance unit.
 */
export function formatMileage(value: number, unit?: string): string {
  const formatted = value.toLocaleString();
  return unit ? `${formatted} ${unit}` : formatted;
}
