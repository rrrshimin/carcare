import {
  MILEAGE_REMINDER_AFTER_DAYS,
  NOTIFICATION_IDS,
} from '@/constants/notification-config';
import { scheduleLocalNotification } from '@/services/notification-service';

import { daysBetween, daysFromNow, tomorrowMorning } from './date-helpers';

/**
 * Pre-schedules the "update your mileage" local notification.
 *
 * TRUE PRE-SCHEDULED LOCAL REMINDER — fires even if the user
 * never reopens the app after this function runs.
 *
 * Called from:
 *   • createVehicle()      — seeds the initial reminder on vehicle creation
 *   • updateMileage()      — reschedules for the next 30-day interval
 *   • evaluateReminders()  — secondary safety net on Home screen load
 *
 * Idempotent: uses a stable notification ID so calling multiple
 * times simply replaces the existing scheduled notification.
 */
export async function scheduleMileageReminder(
  lastMileageUpdateIso: string,
): Promise<void> {
  const now = new Date();
  const lastUpdate = new Date(lastMileageUpdateIso);
  if (isNaN(lastUpdate.getTime())) return;

  const elapsed = daysBetween(lastUpdate, now);
  const daysUntilDue = MILEAGE_REMINDER_AFTER_DAYS - elapsed;
  const triggerDate =
    daysUntilDue <= 0 ? tomorrowMorning() : daysFromNow(daysUntilDue);

  await scheduleLocalNotification(
    NOTIFICATION_IDS.mileageReminder,
    'CarCare Diary',
    "Don't forget to log your mileage.",
    triggerDate,
  );
}
