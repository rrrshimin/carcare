/*
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  Notification Test-Mode — Production-Safe Gating                 │
 * │                                                                  │
 * │  When enabled, notification delays use minutes instead of days   │
 * │  so you can verify that notifications fire, display the right    │
 * │  copy, and deep-link correctly without waiting days.             │
 * │                                                                  │
 * │  Enabled automatically in __DEV__ (Expo dev / Metro).            │
 * │  Also enabled when EXPO_PUBLIC_NOTIFICATION_TEST_MODE=true is    │
 * │  set in the environment (useful for preview / RC builds).        │
 * │                                                                  │
 * │  Production / release builds: always false (no manual flip       │
 * │  required).                                                      │
 * │                                                                  │
 * │  This file is the ONLY place test timing values live.            │
 * │  Production timing in notification-config.ts is untouched.       │
 * └──────────────────────────────────────────────────────────────────┘
 */

// ━━ Master switch ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const NOTIFICATION_TEST_MODE =
  __DEV__ || process.env.EXPO_PUBLIC_NOTIFICATION_TEST_MODE === 'true';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Test delays in minutes (only used when NOTIFICATION_TEST_MODE = true). */
export const TEST_DELAYS = {
  /** Mileage update reminder — production: days, test: 2 min */
  mileageReminder: 2,
  /** Due-soon tier 1 (≤1000 / ≤14 days) — production: 7 days, test: 5 min */
  dueSoonTier1: 5,
  /** Due-soon tier 2 (≤2000 / ≤30 days) — production: 14 days, test: 10 min */
  dueSoonTier2: 10,
} as const;

/** Returns a Date the given number of minutes from now. */
export function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60_000);
}
