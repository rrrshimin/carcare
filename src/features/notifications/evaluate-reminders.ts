/**
 * Central evaluation entry point for all local notification reminders.
 *
 * LOCAL-ONLY MVP SCOPE:
 *   All reminders use local system notifications. No remote push, no
 *   Firebase, no backend cron. Fires even if the app is closed (pre-scheduled).
 *
 * REMINDER TYPES COVERED:
 *   1. Mileage update reminder — configurable interval (off/7/14/30 days)
 *   2. Mileage-based due-soon reminders — two-tier (≤1000/≤2000)
 *   3. Time-based due-soon reminders — two-tier (≤14d/≤30d)
 *
 * FUTURE (requires backend push / server scheduler):
 *   • True mileage-based pre-scheduling (needs driving pattern estimation)
 *   • Multi-device notification sync
 *   • Rich notification actions (snooze, mark done)
 */
import {
  LEGACY_SERVICE_REMINDER_ID,
} from '@/constants/notification-config';
import { getMaintenanceSummary } from '@/features/maintenance/get-maintenance-summary';
import type { VehicleScreenData } from '@/hooks/use-vehicle-data';
import { cancelScheduledNotification } from '@/services/notification-service';
import {
  getReminderSettings,
  getMileageReminderDays,
} from '@/services/reminder-settings-service';
import {
  getLastMileageUpdate,
  setLastMileageUpdate,
} from '@/services/storage-service';
import { convertDistance } from '@/utils/calculations/convert-distance';
import { getLatestLog } from '@/utils/calculations/get-latest-log';
import { getEffectiveDueInterval } from '@/utils/calculations/get-effective-due-interval';
import type { DistanceUnit } from '@/types/vehicle';

import { scheduleMileageReminder } from './schedule-mileage-reminder';
import {
  scheduleMileageBasedReminder,
  scheduleTimeBasedReminders,
} from './schedule-service-reminders';

// ── Re-exports for backward compatibility / testability ──────────────

export { tomorrowMorning, daysFromNow, daysBetween } from './date-helpers';

// ── Mileage Reminder (safety net) ───────────────────────────────────

/**
 * Safety-net scheduling for the mileage update reminder.
 *
 * The PRIMARY scheduling happens at data-mutation points:
 *   • createVehicle() — seeds the initial reminder
 *   • updateMileage() — reschedules after each update
 *
 * This function ensures the reminder exists even if those primary
 * triggers were missed (e.g. app upgrade, AsyncStorage cleared).
 */
async function evaluateMileageReminder(
  vehicle: { id: number; name: string | null },
): Promise<void> {
  const settings = await getReminderSettings();
  const intervalDays = getMileageReminderDays(settings.mileageReminderInterval);

  if (intervalDays === null) {
    // User disabled mileage reminders — make sure nothing is scheduled
    const { cancelMileageReminder } = await import('./schedule-mileage-reminder');
    await cancelMileageReminder(vehicle.id);
    return;
  }

  let lastUpdate = await getLastMileageUpdate(vehicle.id);

  if (!lastUpdate) {
    const fallback = await getLastMileageUpdate();
    lastUpdate = fallback ?? new Date().toISOString();
    await setLastMileageUpdate(lastUpdate, vehicle.id);
  }

  await scheduleMileageReminder(
    lastUpdate,
    vehicle.id,
    vehicle.name ?? undefined,
  );
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
async function ensureTimeBasedNotifications(data: VehicleScreenData): Promise<void> {
  const { vehicle, logTypes, userLogs } = data;
  const carName = vehicle.name ?? 'Your car';
  const timeBasedTypes = logTypes.filter((lt) => lt.due_type === 'time');

  const promises = timeBasedTypes.map((logType) => {
    const latestLog = getLatestLog(userLogs, logType.id, vehicle.id);
    if (!latestLog?.change_date) return Promise.resolve();

    return scheduleTimeBasedReminders(
      vehicle.id,
      logType,
      latestLog.change_date,
      vehicle.fuel_type,
      carName,
    );
  });

  await Promise.allSettled(promises);
}

// ── Mileage-Based Service Reminders (reactive) ──────────────────────

/**
 * REACTIVE scheduling for mileage-based service items.
 *
 * Mileage-based items CANNOT be truly pre-scheduled because we
 * do not know when the user will reach the distance threshold.
 * This is a KNOWN LIMITATION of the local-notification approach.
 *
 * This function runs on every Vehicle screen load and evaluates
 * each mileage-based item individually using the two-tier model:
 *   • remaining ≤1000 → schedule in 7 days
 *   • remaining ≤2000 → schedule in 14 days
 *
 * Each item gets its own stable notification ID, so updating mileage
 * or adding a log automatically replaces the old reminder.
 *
 * FUTURE: Replace with backend push notifications that trigger
 * when mileage-based thresholds are crossed.
 */
async function evaluateMileageBasedServiceReminders(
  data: VehicleScreenData,
): Promise<void> {
  // Cancel the legacy combined service reminder from older versions
  cancelScheduledNotification(LEGACY_SERVICE_REMINDER_ID).catch(() => {});

  const { vehicle, device, logTypes, userLogs } = data;
  const carName = vehicle.name ?? 'Your car';
  const currentOdometer = vehicle.current_odometer ?? 0;
  const fuelType = vehicle.fuel_type;
  const unit: DistanceUnit = device.unit === 'mi' ? 'mi' : 'km';

  const mileageTypes = logTypes.filter((lt) => lt.due_type !== 'time');

  const promises = mileageTypes.map((logType) => {
    const latestLog = getLatestLog(userLogs, logType.id, vehicle.id);
    if (!latestLog?.odo_log) return Promise.resolve();

    const effectiveDueKm = getEffectiveDueInterval(logType, fuelType);
    if (effectiveDueKm <= 0) return Promise.resolve();

    const effectiveDue = convertDistance(effectiveDueKm, unit);
    const nextDueOdometer = latestLog.odo_log + effectiveDue;
    const remaining = nextDueOdometer - currentOdometer;

    return scheduleMileageBasedReminder(
      vehicle.id,
      logType.id,
      logType.log_type_name ?? 'maintenance item',
      carName,
      remaining,
      unit,
    );
  });

  await Promise.allSettled(promises);
}

// ── Public Entry Point ──────────────────────────────────────────────

/**
 * Evaluates all notification reminders based on current vehicle data.
 *
 * This is the SECONDARY SAFETY NET — not the primary trigger.
 *
 * Primary scheduling happens at data-mutation points:
 *   • createVehicle()       → seeds mileage reminder
 *   • updateMileage()       → reschedules mileage reminder
 *   • addMaintenanceLog()   → schedules time-based service reminders
 *
 * This function ensures completeness on Vehicle screen load:
 *   1. Mileage update reminder — re-verifies it's scheduled
 *   2. Due-soon service reminders (both time-based and mileage-based)
 *      — only if the user has due-soon reminders enabled
 *
 * Respects user settings from Reminder Settings screen:
 *   • mileageReminderInterval: off / 7 / 14 / 30
 *   • dueSoonRemindersEnabled: true / false
 *
 * Safe to call on every vehicle-screen focus:
 *   • Scheduling is idempotent (cancel-then-schedule with stable IDs).
 *   • The hook layer adds a 60-second debounce on top.
 *
 * Uses `Promise.allSettled` so a failure in one area does not
 * prevent the others from being evaluated.
 */
export async function evaluateReminders(data: VehicleScreenData): Promise<void> {
  try {
    const settings = await getReminderSettings();

    const tasks: Promise<void>[] = [
      evaluateMileageReminder(data.vehicle),
    ];

    if (settings.dueSoonRemindersEnabled) {
      tasks.push(ensureTimeBasedNotifications(data));
      tasks.push(evaluateMileageBasedServiceReminders(data));
    }

    await Promise.allSettled(tasks);
  } catch {
    // Belt-and-suspenders: never crash the app over notifications.
  }
}
