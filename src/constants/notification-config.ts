/*
 * Notification Scope (MVP)
 * ────────────────────────
 *
 * LOCAL NOTIFICATIONS ONLY. No remote push. Works in Expo Go on Android SDK 53+.
 * Do not call getExpoPushTokenAsync, getDevicePushTokenAsync, or addPushTokenListener.
 *
 * PRE-SCHEDULED (work even if app is never reopened):
 *   • Mileage update reminder — fires after configurable interval (off/7/14/30 days)
 *     since the last mileage update. Includes the car name.
 *     Scheduled by createVehicle(), updateMileage(), and evaluateReminders().
 *   • Time-based svc due-soon — two-tier:
 *       ≤14 days remaining → reminder in 1 week
 *       ≤30 days remaining → reminder in 2 weeks
 *     Scheduled by addMaintenanceLog() and evaluateReminders().
 *
 * REACTIVE (require Vehicle screen load to evaluate):
 *   • Mileage-based svc due-soon — two-tier:
 *       remaining ≤1000 → reminder in 1 week
 *       remaining ≤2000 → reminder in 2 weeks
 *     Evaluated on Vehicle screen focus; pre-scheduled at computed dates.
 *
 * FUTURE (require backend push / server scheduler):
 *   • True mileage-based pre-scheduling (needs driving pattern estimation)
 *   • Multi-device notification sync
 *   • Rich notification actions (snooze, mark done)
 *
 * Duplicate prevention:
 *   Every notification uses a STABLE identifier. scheduleLocalNotification()
 *   always cancels the previous notification with the same ID before
 *   scheduling the replacement, so duplicates are impossible.
 *
 * Notification tap deep-link data:
 *   Notifications carry a `data` payload with `type` and optional `vehicleId`
 *   so the app can route the user to the right screen on tap:
 *     • mileage-reminder → UpdateMileage screen
 *     • service-due-soon → Vehicle screen
 */

/** Android notification channel (required on API 26+). */
export const ANDROID_CHANNEL_ID = 'carcare-reminders';
export const ANDROID_CHANNEL_NAME = 'Maintenance Reminders';

/** Minimum milliseconds between full evaluation runs in the hook. */
export const EVAL_COOLDOWN_MS = 60_000;

// ── Stable notification identifiers ──────────────────────────────────

/** Per-vehicle mileage update reminder. */
export function mileageReminderId(vehicleId: number): string {
  return `carcare-mileage-reminder-${vehicleId}`;
}

// Legacy global ID kept for cancellation during migration
export const LEGACY_MILEAGE_REMINDER_ID = 'carcare-mileage-reminder';

/** Per-vehicle per-logType mileage-based service due-soon (≤1000 tier). */
export function mileageServiceTier1Id(vehicleId: number, logTypeId: number): string {
  return `carcare-mi-svc-t1-${vehicleId}-${logTypeId}`;
}

/** Per-vehicle per-logType mileage-based service due-soon (≤2000 tier). */
export function mileageServiceTier2Id(vehicleId: number, logTypeId: number): string {
  return `carcare-mi-svc-t2-${vehicleId}-${logTypeId}`;
}

/** Per-vehicle per-logType time-based service due-soon (≤14 days tier). */
export function timeServiceTier1Id(vehicleId: number, logTypeId: number): string {
  return `carcare-tm-svc-t1-${vehicleId}-${logTypeId}`;
}

/** Per-vehicle per-logType time-based service due-soon (≤30 days tier). */
export function timeServiceTier2Id(vehicleId: number, logTypeId: number): string {
  return `carcare-tm-svc-t2-${vehicleId}-${logTypeId}`;
}

// Legacy IDs kept for cancellation during migration
export function timeServiceWarningId(vehicleId: number, logTypeId: number): string {
  return `carcare-svc-warn-${vehicleId}-${logTypeId}`;
}
export function timeServiceDueId(vehicleId: number, logTypeId: number): string {
  return `carcare-svc-due-${vehicleId}-${logTypeId}`;
}
export const LEGACY_SERVICE_REMINDER_ID = 'carcare-service-reminder';

// ── Notification data types for deep-link routing ────────────────────

export type NotificationDataType = 'mileage-reminder' | 'service-due-soon';

export type NotificationData = {
  type: NotificationDataType;
  vehicleId?: number;
};

// ── Thresholds for due-soon reminder tiers ───────────────────────────
// Mileage thresholds are in canonical km — convert via convertDistance()
// before comparing with user-unit remaining distances.

/** Mileage-based (canonical km): ≤1000 remaining → schedule reminder in 7 days. */
export const MILEAGE_DUE_TIER1_THRESHOLD = 1000;
export const MILEAGE_DUE_TIER1_DELAY_DAYS = 7;

/** Mileage-based (canonical km): ≤2000 remaining → schedule reminder in 14 days. */
export const MILEAGE_DUE_TIER2_THRESHOLD = 2000;
export const MILEAGE_DUE_TIER2_DELAY_DAYS = 14;

/** Time-based: ≤14 days remaining → schedule reminder in 7 days. */
export const TIME_DUE_TIER1_THRESHOLD_DAYS = 14;
export const TIME_DUE_TIER1_DELAY_DAYS = 7;

/** Time-based: ≤30 days remaining → schedule reminder in 14 days. */
export const TIME_DUE_TIER2_THRESHOLD_DAYS = 30;
export const TIME_DUE_TIER2_DELAY_DAYS = 14;
