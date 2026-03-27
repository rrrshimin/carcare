/**
 * Due-soon maintenance reminder scheduling.
 *
 * LOCAL-ONLY MVP SCOPE:
 *   Uses local system notifications. Fires even if the app is closed.
 *
 * TWO-TIER LOGIC:
 *
 *   A. Mileage-based items:
 *      • remaining ≤1000 → schedule reminder in 7 days (tier 1)
 *      • remaining ≤2000 → schedule reminder in 14 days (tier 2)
 *      • neither → cancel both tiers
 *
 *   B. Time-based items:
 *      • remaining ≤14 days → schedule reminder in 7 days (tier 1)
 *      • remaining ≤30 days → schedule reminder in 14 days (tier 2)
 *      • neither → cancel both tiers
 *
 *   Only one tier fires at a time: if the closer (tier 1) condition is met,
 *   the outer (tier 2) notification is cancelled because the user will
 *   already get the more urgent one.
 *
 * DEDUPLICATION / CANCEL-RESCHEDULE:
 *   Each notification has a stable per-vehicle per-logType identifier.
 *   Re-scheduling with the same ID replaces the previous one.
 *   When mileage is updated or a new log is saved, old reminders are
 *   automatically replaced by the new evaluation.
 *
 * FUTURE:
 *   Replace mileage-based reactive scheduling with backend push
 *   notifications that trigger when odometer thresholds are crossed,
 *   or when the backend can estimate driving patterns.
 */
import {
  MILEAGE_DUE_TIER1_THRESHOLD,
  MILEAGE_DUE_TIER1_DELAY_DAYS,
  MILEAGE_DUE_TIER2_THRESHOLD,
  MILEAGE_DUE_TIER2_DELAY_DAYS,
  TIME_DUE_TIER1_THRESHOLD_DAYS,
  TIME_DUE_TIER1_DELAY_DAYS,
  TIME_DUE_TIER2_THRESHOLD_DAYS,
  TIME_DUE_TIER2_DELAY_DAYS,
  mileageServiceTier1Id,
  mileageServiceTier2Id,
  timeServiceTier1Id,
  timeServiceTier2Id,
  timeServiceWarningId,
  timeServiceDueId,
  type NotificationData,
} from '@/constants/notification-config';
import type { LogTypeRow } from '@/services/api/log-type-api';
import {
  cancelScheduledNotification,
  scheduleLocalNotification,
} from '@/services/notification-service';
import { convertDistance } from '@/utils/calculations/convert-distance';
import { getEffectiveDueInterval } from '@/utils/calculations/get-effective-due-interval';
import type { DistanceUnit } from '@/types/vehicle';

import { daysFromNow } from './date-helpers';
import { NOTIFICATION_TEST_MODE, TEST_DELAYS, minutesFromNow } from './notification-test-mode';

// ── Mileage-Based Due-Soon Reminders ─────────────────────────────────

/**
 * Schedules or cancels mileage-based due-soon reminders for a single item.
 *
 * Called from evaluateReminders() on every Vehicle screen focus.
 *
 * REACTIVE: Since we can't predict when the odometer will cross a threshold,
 * these are evaluated when the app is open and pre-scheduled from that point.
 */
export async function scheduleMileageBasedReminder(
  vehicleId: number,
  logTypeId: number,
  logTypeName: string,
  carName: string,
  remainingDistance: number,
  distanceUnit: DistanceUnit = 'km',
): Promise<void> {
  const t1Id = mileageServiceTier1Id(vehicleId, logTypeId);
  const t2Id = mileageServiceTier2Id(vehicleId, logTypeId);
  const data: NotificationData = { type: 'service-due-soon', vehicleId };

  const displayCar = carName.trim() || 'Your car';
  const displayItem = logTypeName || 'maintenance item';

  const tier1 = convertDistance(MILEAGE_DUE_TIER1_THRESHOLD, distanceUnit);
  const tier2 = convertDistance(MILEAGE_DUE_TIER2_THRESHOLD, distanceUnit);

  if (remainingDistance <= tier1) {
    await cancelScheduledNotification(t2Id);
    const label = remainingDistance < 0 ? 'overdue' : `${Math.round(remainingDistance).toLocaleString()} ${distanceUnit} left`;
    await scheduleLocalNotification(
      t1Id,
      displayCar,
      `${displayItem} is due soon — ${label}`,
      NOTIFICATION_TEST_MODE ? minutesFromNow(TEST_DELAYS.dueSoonTier1) : daysFromNow(MILEAGE_DUE_TIER1_DELAY_DAYS),
      data as Record<string, unknown>,
    );
  } else if (remainingDistance <= tier2) {
    await cancelScheduledNotification(t1Id);
    await scheduleLocalNotification(
      t2Id,
      displayCar,
      `${displayItem} is due soon — ${Math.round(remainingDistance).toLocaleString()} ${distanceUnit} left`,
      NOTIFICATION_TEST_MODE ? minutesFromNow(TEST_DELAYS.dueSoonTier2) : daysFromNow(MILEAGE_DUE_TIER2_DELAY_DAYS),
      data as Record<string, unknown>,
    );
  } else {
    await Promise.allSettled([
      cancelScheduledNotification(t1Id),
      cancelScheduledNotification(t2Id),
    ]);
  }
}

/**
 * Cancels mileage-based due-soon reminders for a vehicle + log type pair.
 */
export async function cancelMileageBasedReminders(
  vehicleId: number,
  logTypeId: number,
): Promise<void> {
  await Promise.allSettled([
    cancelScheduledNotification(mileageServiceTier1Id(vehicleId, logTypeId)),
    cancelScheduledNotification(mileageServiceTier2Id(vehicleId, logTypeId)),
  ]);
}

// ── Time-Based Due-Soon Reminders ────────────────────────────────────

/**
 * Schedules or cancels time-based due-soon reminders for a single item.
 *
 * Called from:
 *   • addMaintenanceLog() — primary trigger when a time-based log is saved
 *   • evaluateReminders() — secondary safety net on Vehicle screen load
 */
export async function scheduleTimeBasedReminders(
  vehicleId: number,
  logType: LogTypeRow,
  changeDate: string,
  fuelType: string | null,
  carName?: string,
): Promise<void> {
  if (logType.due_type !== 'time') return;
  if (!changeDate) return;

  const effectiveDue = getEffectiveDueInterval(logType, fuelType);
  if (effectiveDue <= 0) return;

  const logTypeName = logType.log_type_name ?? 'maintenance item';
  const displayCar = carName?.trim() || 'Your car';

  const t1Id = timeServiceTier1Id(vehicleId, logType.id);
  const t2Id = timeServiceTier2Id(vehicleId, logType.id);
  const data: NotificationData = { type: 'service-due-soon', vehicleId };

  // Cancel legacy notification IDs from the old implementation
  cancelScheduledNotification(timeServiceWarningId(vehicleId, logType.id)).catch(() => {});
  cancelScheduledNotification(timeServiceDueId(vehicleId, logType.id)).catch(() => {});

  const parts = changeDate.split('-');
  const lastDate =
    parts.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      : new Date(changeDate);

  if (isNaN(lastDate.getTime())) return;

  const nextDueDate = new Date(lastDate);
  nextDueDate.setDate(nextDueDate.getDate() + effectiveDue);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const remainingDays = Math.ceil(
    (nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (remainingDays <= TIME_DUE_TIER1_THRESHOLD_DAYS) {
    // Tier 1: urgent — remind in 7 days, cancel tier 2
    await cancelScheduledNotification(t2Id);
    const unit = remainingDays < 0 ? 'overdue' : `${remainingDays} days left`;
    await scheduleLocalNotification(
      t1Id,
      displayCar,
      `${logTypeName} is due soon — ${unit}`,
      NOTIFICATION_TEST_MODE ? minutesFromNow(TEST_DELAYS.dueSoonTier1) : daysFromNow(TIME_DUE_TIER1_DELAY_DAYS),
      data as Record<string, unknown>,
    );
  } else if (remainingDays <= TIME_DUE_TIER2_THRESHOLD_DAYS) {
    // Tier 2: heads-up — remind in 14 days, cancel tier 1
    await cancelScheduledNotification(t1Id);
    await scheduleLocalNotification(
      t2Id,
      displayCar,
      `${logTypeName} is due soon — ${remainingDays} days left`,
      NOTIFICATION_TEST_MODE ? minutesFromNow(TEST_DELAYS.dueSoonTier2) : daysFromNow(TIME_DUE_TIER2_DELAY_DAYS),
      data as Record<string, unknown>,
    );
  } else {
    // Not due soon — cancel both tiers
    await Promise.allSettled([
      cancelScheduledNotification(t1Id),
      cancelScheduledNotification(t2Id),
    ]);
  }
}

/**
 * Cancels any scheduled time-based reminders for a specific
 * vehicle + log type pair (both new tier IDs and legacy IDs).
 */
export async function cancelTimeBasedReminders(
  vehicleId: number,
  logTypeId: number,
): Promise<void> {
  await Promise.allSettled([
    cancelScheduledNotification(timeServiceTier1Id(vehicleId, logTypeId)),
    cancelScheduledNotification(timeServiceTier2Id(vehicleId, logTypeId)),
    cancelScheduledNotification(timeServiceWarningId(vehicleId, logTypeId)),
    cancelScheduledNotification(timeServiceDueId(vehicleId, logTypeId)),
  ]);
}
