import type { LogTypeRow } from '@/services/api/log-type-api';
import type { UserLogRow } from '@/services/api/user-log-api';
import { submitLog, type CreateLogInput } from '@/services/log-service';

import { scheduleTimeBasedReminders } from '@/features/notifications/schedule-service-reminders';

/**
 * Saves a maintenance log and schedules time-based service reminders
 * when the log type is time-based (due_type = 'time').
 *
 * This is the PRIMARY trigger for pre-scheduled time-based service
 * notifications. The Home screen safety net provides a secondary
 * guarantee via evaluateReminders().
 */
export async function addMaintenanceLog(
  input: CreateLogInput,
  logType: LogTypeRow,
  fuelType: string | null,
): Promise<UserLogRow> {
  const log = await submitLog(input);

  scheduleTimeBasedReminders(
    input.carId,
    logType,
    input.changeDate,
    fuelType,
  ).catch(() => {});

  return log;
}
