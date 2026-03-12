/*
 * Notification Scope (MVP)
 * ────────────────────────
 *
 * LOCAL NOTIFICATIONS ONLY. No remote push. Works in Expo Go on Android SDK 53+.
 * Do not call getExpoPushTokenAsync, getDevicePushTokenAsync, or addPushTokenListener.
 *
 * PRE-SCHEDULED (work even if app is never reopened):
 *   • Mileage reminder        — fires MILEAGE_REMINDER_AFTER_DAYS after
 *                                last mileage update.  Scheduled by
 *                                createVehicle() and updateMileage().
 *   • Time-based svc warning  — fires WARNING_DAYS before the computed
 *                                due date.  Scheduled by addMaintenanceLog().
 *   • Time-based svc due      — fires on the due date itself.
 *                                Scheduled by addMaintenanceLog().
 *
 * REACTIVE (require Home screen load to evaluate):
 *   • Mileage-based svc       — cannot pre-schedule because the trigger
 *                                depends on the vehicle odometer reaching a
 *                                threshold we can't predict.  Evaluated on
 *                                Home focus; schedules for "tomorrow 9 AM".
 *
 * FUTURE (require backend push / server scheduler):
 *   • Mileage-based svc pre-scheduling
 *   • Multi-device notification sync
 *   • Rich notification actions (snooze, mark done)
 *
 * Duplicate prevention:
 *   Every notification uses a STABLE identifier.  scheduleLocalNotification()
 *   always cancels the previous notification with the same ID before
 *   scheduling the replacement, so duplicates are impossible.
 */

/** Days without a mileage update before a reminder fires (business-logic.md §17A). */
export const MILEAGE_REMINDER_AFTER_DAYS = 30;

/** Minimum days between repeated mileage-based service-due reminders to avoid spam. */
export const SERVICE_REMINDER_COOLDOWN_DAYS = 7;

/** Stable identifiers for scheduled notifications (used to cancel/replace). */
export const NOTIFICATION_IDS = {
  mileageReminder: 'carcare-mileage-reminder',
  /**
   * Reactive combined notification for mileage-based service items.
   * Scheduled on Home screen load when mileage-based items are in warning/overdue.
   * FUTURE: Replace with per-item backend push when mileage tracking improves.
   */
  serviceReminder: 'carcare-service-reminder',
} as const;

/** Android notification channel (required on API 26+). */
export const ANDROID_CHANNEL_ID = 'carcare-reminders';
export const ANDROID_CHANNEL_NAME = 'Maintenance Reminders';

/** Minimum milliseconds between full evaluation runs in the hook. */
export const EVAL_COOLDOWN_MS = 60_000;

/** Builds a stable notification ID for a time-based service warning reminder. */
export function timeServiceWarningId(vehicleId: number, logTypeId: number): string {
  return `carcare-svc-warn-${vehicleId}-${logTypeId}`;
}

/** Builds a stable notification ID for a time-based service due reminder. */
export function timeServiceDueId(vehicleId: number, logTypeId: number): string {
  return `carcare-svc-due-${vehicleId}-${logTypeId}`;
}
