/**
 * Formats a numeric mileage value with locale-aware thousand separators.
 * Optionally appends the distance unit.
 */
export function formatMileage(value: number, unit?: string): string {
  const formatted = value.toLocaleString();
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Rounds a maintenance distance value for display labels (e.g. "Change in X km").
 *
 *   0–99     → exact
 *   100–999  → nearest 10
 *   1000+    → nearest 100
 *
 * Always operates on the absolute value and returns a positive result,
 * so callers should handle sign/prefix separately.
 */
export function roundDisplayDistance(value: number): number {
  const abs = Math.abs(value);
  if (abs < 100) return abs;
  if (abs < 1000) return Math.round(abs / 10) * 10;
  return Math.round(abs / 100) * 100;
}

/**
 * Formats a maintenance distance remaining/overdue value for display.
 * Applies display rounding, then locale-aware thousand separators.
 */
export function formatDisplayDistance(value: number): string {
  return roundDisplayDistance(value).toLocaleString();
}
