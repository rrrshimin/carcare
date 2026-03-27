import type { LogTypeRow } from '@/services/api/log-type-api';
import type { UserLogRow } from '@/services/api/user-log-api';
import { submitLog, type CreateLogInput } from '@/services/log-service';
import { getReminderSettings } from '@/services/reminder-settings-service';

import { scheduleTimeBasedReminders } from '@/features/notifications/schedule-service-reminders';

/**
 * Saves a maintenance log and schedules time-based service reminders
 * when the log type is time-based (due_type = 'time') and due-soon
 * reminders are enabled in user settings.
 *
 * This is the PRIMARY trigger for pre-scheduled time-based service
 * notifications. The Vehicle screen safety net provides a secondary
 * guarantee via evaluateReminders().
 */
export async function addMaintenanceLog(
  input: CreateLogInput,
  logType: LogTypeRow,
  fuelType: string | null,
  carName?: string,
): Promise<UserLogRow> {
  const log = await submitLog(input);

  const settings = await getReminderSettings();
  if (settings.dueSoonRemindersEnabled) {
    scheduleTimeBasedReminders(
      input.carId,
      logType,
      input.changeDate,
      fuelType,
      carName,
    ).catch(() => {});
  }

  return log;
}
