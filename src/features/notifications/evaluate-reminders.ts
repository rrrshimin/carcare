import {
  MILEAGE_REMINDER_AFTER_DAYS,
  NOTIFICATION_IDS,
  SERVICE_REMINDER_COOLDOWN_DAYS,
} from '@/constants/notification-config';
import { getMaintenanceSummary } from '@/features/maintenance/get-maintenance-summary';
import type { HomeData } from '@/hooks/use-home-data';
import {
  cancelScheduledNotification,
  scheduleLocalNotification,
} from '@/services/notification-service';
import {
  getLastMileageUpdate,
  getStoredJson,
  setLastMileageUpdate,
  setStoredJson,
} from '@/services/storage-service';
import { getLatestLog } from '@/utils/calculations/get-latest-log';

import { daysBetween, daysFromNow, tomorrowMorning } from './date-helpers';
import { scheduleMileageReminder } from './schedule-mileage-reminder';
import { scheduleTimeBasedReminders } from './schedule-service-reminders';

const SERVICE_COOLDOWN_KEY = 'carcare.last_service_reminder';

// ── Re-exports for backward compatibility / testability ──────────────

export { tomorrowMorning, daysFromNow, daysBetween } from './date-helpers';

// ── Pure helpers (exported for testability) ──────────────────────────

/**
 * Returns the trigger date for the next mileage reminder.
 * Pure function — no side-effects, easy to unit-test.
 *
 * @param lastUpdateIso  ISO-8601 timestamp of the last mileage update.
 * @param now            Current date (injectable for tests).
 */
export function computeMileageTriggerDate(
  lastUpdateIso: string,
  now: Date = new Date(),
): Date {
  const elapsed = daysBetween(new Date(lastUpdateIso), now);
  const daysUntilDue = MILEAGE_REMINDER_AFTER_DAYS - elapsed;
  return daysUntilDue <= 0 ? tomorrowMorning() : daysFromNow(daysUntilDue);
}

/**
 * Collects maintenance items in warning or overdue state.
 * Pure function — no side-effects, easy to unit-test.
 */
export function collectDueItems(
  data: HomeData,
): { id: number; name: string }[] {
  const summary = getMaintenanceSummary(data);
  const items: { id: number; name: string }[] = [];

  for (const category of summary) {
    for (const item of category.items) {
      if (item.status.variant === 'warning' || item.status.variant === 'overdue') {
        items.push({ id: item.id, name: item.name });
      }
    }
  }

  return items;
}

/** Builds the notification body from a list of due items. */
export function buildServiceReminderBody(
  dueItems: { name: string }[],
): string {
  if (dueItems.length === 1) {
    return `Time to change ${dueItems[0].name}.`;
  }
  return `${dueItems.length} maintenance items need attention.`;
}

// ── Mileage Reminder (safety net) ───────────────────────────────────

/**
 * Safety-net scheduling for the mileage reminder.
 *
 * The PRIMARY scheduling happens at data-mutation points:
 *   • createVehicle() — seeds the initial reminder
 *   • updateMileage() — reschedules after each update
 *
 * This function ensures the reminder exists even if those primary
 * triggers were missed (e.g. app upgrade, AsyncStorage cleared).
 */
async function evaluateMileageReminder(): Promise<void> {
  let lastUpdate = await getLastMileageUpdate();

  if (!lastUpdate) {
    const now = new Date().toISOString();
    await setLastMileageUpdate(now);
    lastUpdate = now;
  }

  await scheduleMileageReminder(lastUpdate);
}

// ── Time-Based Service Reminders (safety net) ───────────────────────

/**
 * Safety-net scheduling for time-based service reminders.
 *
 * The PRIMARY scheduling happens in addMaintenanceLog() when a
 * time-based log is saved. This function iterates all time-based
 * log types and ensures notifications are scheduled for each one
 * that has at least one user log.
 *
 * Idempotent: re-scheduling with the same stable IDs replaces
 * existing scheduled notifications.
 */
async function ensureTimeBasedNotifications(data: HomeData): Promise<void> {
  const { vehicle, logTypes, userLogs } = data;
  const timeBasedTypes = logTypes.filter((lt) => lt.due_type === 'time');

  const promises = timeBasedTypes.map((logType) => {
    const latestLog = getLatestLog(userLogs, logType.id, vehicle.id);
    if (!latestLog?.change_date) return Promise.resolve();

    return scheduleTimeBasedReminders(
      vehicle.id,
      logType,
      latestLog.change_date,
      vehicle.fuel_type,
    );
  });

  await Promise.allSettled(promises);
}

// ── Mileage-Based Service Reminders (reactive only) ─────────────────

/**
 * REACTIVE notification for mileage-based service items.
 *
 * Mileage-based items CANNOT be truly pre-scheduled because we
 * do not know when the user will reach the distance threshold.
 * This is a KNOWN LIMITATION of the local-notification approach.
 *
 * This function runs on every Home screen load and schedules a
 * combined "tomorrow morning" notification if any mileage-based
 * items are currently in warning or overdue state.
 *
 * FUTURE: Replace with backend push notifications that trigger
 * when mileage-based thresholds are crossed, or when the backend
 * can estimate driving patterns to predict threshold dates.
 */
async function evaluateMileageBasedServiceReminders(
  data: HomeData,
): Promise<void> {
  const summary = getMaintenanceSummary(data);
  const dueItems: { id: number; name: string }[] = [];

  for (const category of summary) {
    for (const item of category.items) {
      if (
        item.status.variant === 'warning' ||
        item.status.variant === 'overdue'
      ) {
        const logType = data.logTypes.find((lt) => lt.id === item.id);
        if (logType?.due_type !== 'time') {
          dueItems.push({ id: item.id, name: item.name });
        }
      }
    }
  }

  if (dueItems.length === 0) {
    await cancelScheduledNotification(NOTIFICATION_IDS.serviceReminder);
    return;
  }

  const lastSent = await getStoredJson<string>(SERVICE_COOLDOWN_KEY);
  if (lastSent) {
    const elapsed = daysBetween(new Date(lastSent), new Date());
    if (elapsed < SERVICE_REMINDER_COOLDOWN_DAYS) return;
  }

  const body = buildServiceReminderBody(dueItems);

  const sent = await scheduleLocalNotification(
    NOTIFICATION_IDS.serviceReminder,
    'CarCare Diary',
    body,
    tomorrowMorning(),
  );

  if (sent) {
    await setStoredJson(SERVICE_COOLDOWN_KEY, new Date().toISOString());
  }
}

// ── Public Entry Point ──────────────────────────────────────────────

/**
 * Evaluates all notification reminders based on current home data.
 *
 * This is the SECONDARY SAFETY NET — not the primary trigger.
 *
 * Primary scheduling happens at data-mutation points:
 *   • createVehicle()       → seeds mileage reminder
 *   • updateMileage()       → reschedules mileage reminder
 *   • addMaintenanceLog()   → schedules time-based service reminders
 *
 * This function ensures completeness on Home screen load:
 *   1. Mileage reminder — re-verifies it's scheduled
 *   2. Time-based service reminders — ensures all items are covered
 *   3. Mileage-based service reminders — REACTIVE ONLY, cannot be
 *      pre-scheduled (known limitation, see function above)
 *
 * Safe to call on every home-screen focus:
 *   • Scheduling is idempotent (cancel-then-schedule with stable IDs).
 *   • Mileage-based service reminders have a 7-day cooldown.
 *   • The hook layer adds a 60-second debounce on top.
 *
 * Uses `Promise.allSettled` so a failure in one area does not
 * prevent the others from being evaluated.
 */
export async function evaluateReminders(data: HomeData): Promise<void> {
  try {
    await Promise.allSettled([
      evaluateMileageReminder(),
      ensureTimeBasedNotifications(data),
      evaluateMileageBasedServiceReminders(data),
    ]);
  } catch {
    // Belt-and-suspenders: never crash the app over notifications.
  }
}
