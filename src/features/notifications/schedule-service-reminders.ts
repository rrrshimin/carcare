import { WARNING_DAYS } from '@/constants/maintenance-thresholds';
import {
  timeServiceDueId,
  timeServiceWarningId,
} from '@/constants/notification-config';
import type { LogTypeRow } from '@/services/api/log-type-api';
import {
  cancelScheduledNotification,
  scheduleLocalNotification,
} from '@/services/notification-service';
import { getEffectiveDueInterval } from '@/utils/calculations/get-effective-due-interval';

/**
 * Pre-schedules local notifications for a time-based maintenance item.
 *
 * TRUE PRE-SCHEDULED LOCAL REMINDERS — fire even if the user
 * never reopens the app after this function runs.
 *
 * Schedules up to two notifications:
 *   1. Warning: due_date − WARNING_DAYS (30 days before due)
 *   2. Due: on the due_date itself
 *
 * Uses stable per-vehicle per-logType identifiers so re-calling
 * for the same combination automatically replaces previous
 * notifications. Past dates are silently skipped by the
 * notification service.
 *
 * Called from:
 *   • addMaintenanceLog() — primary trigger when a log is saved
 *   • evaluateReminders() — secondary safety net on Home screen load
 *
 * LIMITATION — Mileage-based reminders:
 *   Mileage-based service items (due_type = 'mileage') CANNOT be
 *   pre-scheduled because we cannot predict when the user will
 *   reach the distance threshold. Those items still rely on:
 *     • Home screen evaluation (reactive, fires next morning)
 *     • FUTURE: backend push notifications triggered by odometer updates
 */
export async function scheduleTimeBasedReminders(
  vehicleId: number,
  logType: LogTypeRow,
  changeDate: string,
  fuelType: string | null,
): Promise<void> {
  if (logType.due_type !== 'time') return;
  if (!changeDate) return;

  const effectiveDue = getEffectiveDueInterval(logType, fuelType);
  if (effectiveDue <= 0) return;

  const logTypeName = logType.log_type_name ?? 'maintenance item';
  const warnId = timeServiceWarningId(vehicleId, logType.id);
  const dueId = timeServiceDueId(vehicleId, logType.id);

  const parts = changeDate.split('-');
  const lastDate =
    parts.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      : new Date(changeDate);

  if (isNaN(lastDate.getTime())) return;

  const nextDueDate = new Date(lastDate);
  nextDueDate.setDate(nextDueDate.getDate() + effectiveDue);
  nextDueDate.setHours(9, 0, 0, 0);

  const warningDate = new Date(nextDueDate);
  warningDate.setDate(warningDate.getDate() - WARNING_DAYS);
  warningDate.setHours(9, 0, 0, 0);

  await scheduleLocalNotification(
    warnId,
    'CarCare Diary',
    `${logTypeName} service is coming up soon.`,
    warningDate,
  ).catch(() => {});

  await scheduleLocalNotification(
    dueId,
    'CarCare Diary',
    `Time to change ${logTypeName}.`,
    nextDueDate,
  ).catch(() => {});
}

/**
 * Cancels any scheduled time-based reminders for a specific
 * vehicle + log type pair.
 */
export async function cancelTimeBasedReminders(
  vehicleId: number,
  logTypeId: number,
): Promise<void> {
  await Promise.allSettled([
    cancelScheduledNotification(timeServiceWarningId(vehicleId, logTypeId)),
    cancelScheduledNotification(timeServiceDueId(vehicleId, logTypeId)),
  ]);
}
