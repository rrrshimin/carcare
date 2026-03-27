import {
  mileageReminderId,
  LEGACY_MILEAGE_REMINDER_ID,
  type NotificationData,
} from '@/constants/notification-config';
import {
  cancelScheduledNotification,
  scheduleLocalNotification,
} from '@/services/notification-service';
import {
  getReminderSettings,
  getMileageReminderDays,
} from '@/services/reminder-settings-service';

import { daysBetween, daysFromNow, tomorrowMorning } from './date-helpers';
import { NOTIFICATION_TEST_MODE, TEST_DELAYS, minutesFromNow } from './notification-test-mode';

/**
 * Pre-schedules the "update your mileage" local notification.
 *
 * TRUE PRE-SCHEDULED LOCAL REMINDER — fires even if the user
 * never reopens the app after this function runs.
 *
 * The interval is user-configurable (off / 7 / 14 / 30 days) via
 * the Reminder Settings screen. When set to "off", any existing
 * mileage reminder for this vehicle is cancelled.
 *
 * Called from:
 *   • createVehicle()      — seeds the initial reminder on vehicle creation
 *   • updateMileage()      — reschedules for the next interval
 *   • evaluateReminders()  — secondary safety net on Vehicle screen load
 *
 * Idempotent: uses a stable per-vehicle notification ID so calling
 * multiple times simply replaces the existing scheduled notification.
 *
 * @param lastMileageUpdateIso  ISO timestamp of the last mileage update
 * @param vehicleId             Vehicle ID for stable notification ID
 * @param carName               Vehicle name to include in notification copy
 */
export async function scheduleMileageReminder(
  lastMileageUpdateIso: string,
  vehicleId?: number,
  carName?: string,
): Promise<void> {
  const settings = await getReminderSettings();
  const intervalDays = getMileageReminderDays(settings.mileageReminderInterval);

  const id = vehicleId != null
    ? mileageReminderId(vehicleId)
    : LEGACY_MILEAGE_REMINDER_ID;

  // Cancel legacy global reminder if we're now using per-vehicle IDs
  if (vehicleId != null) {
    cancelScheduledNotification(LEGACY_MILEAGE_REMINDER_ID).catch(() => {});
  }

  if (intervalDays === null) {
    await cancelScheduledNotification(id);
    return;
  }

  const now = new Date();
  const lastUpdate = new Date(lastMileageUpdateIso);
  if (isNaN(lastUpdate.getTime())) return;

  const elapsed = daysBetween(lastUpdate, now);
  const daysUntilDue = intervalDays - elapsed;
  const triggerDate = NOTIFICATION_TEST_MODE
    ? minutesFromNow(TEST_DELAYS.mileageReminder)
    : daysUntilDue <= 0 ? tomorrowMorning() : daysFromNow(daysUntilDue);

  const displayName = carName?.trim() || 'your car';

  const data: NotificationData = {
    type: 'mileage-reminder',
    ...(vehicleId != null ? { vehicleId } : {}),
  };

  await scheduleLocalNotification(
    id,
    'Update Mileage',
    `${displayName} — time to log your mileage`,
    triggerDate,
    data as Record<string, unknown>,
  );
}

/**
 * Cancels any mileage reminder for a specific vehicle.
 * Used when the user turns off mileage reminders or deletes a vehicle.
 */
export async function cancelMileageReminder(vehicleId: number): Promise<void> {
  await cancelScheduledNotification(mileageReminderId(vehicleId));
}
