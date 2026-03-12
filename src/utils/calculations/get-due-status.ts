import { WARNING_DAYS, WARNING_DISTANCE } from '@/constants/maintenance-thresholds';
import type { MaintenanceItemStatus } from '@/types/maintenance';

export type DueCalculation = {
  status: MaintenanceItemStatus;
  remaining: number;
};

/**
 * Mileage-based due status (business-logic.md §6).
 * remaining = (latestLogOdo + effectiveDue) − currentOdometer
 */
export function getMileageDueStatus(
  currentOdometer: number,
  latestLogOdo: number,
  effectiveDue: number,
  unit: string,
  warningThreshold: number = WARNING_DISTANCE,
): DueCalculation {
  const remaining = latestLogOdo + effectiveDue - currentOdometer;

  if (remaining < 0) {
    return {
      status: {
        variant: 'overdue',
        label: `Overdue by ${fmt(Math.abs(remaining))} ${unit}`,
      },
      remaining,
    };
  }

  if (remaining <= warningThreshold) {
    return {
      status: {
        variant: 'warning',
        label: `Change in ${fmt(remaining)} ${unit}`,
      },
      remaining,
    };
  }

  return {
    status: {
      variant: 'normal',
      label: `Change in ${fmt(remaining)} ${unit}`,
    },
    remaining,
  };
}

/**
 * Time-based due status (business-logic.md §7).
 * remaining = (lastChangeDate + effectiveDueDays) − today
 */
export function getTimeDueStatus(
  lastChangeDate: string,
  effectiveDueDays: number,
  warningThresholdDays: number = WARNING_DAYS,
): DueCalculation {
  const lastDate = parseLocalDate(lastChangeDate);
  const nextDueDate = new Date(lastDate);
  nextDueDate.setDate(nextDueDate.getDate() + effectiveDueDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  nextDueDate.setHours(0, 0, 0, 0);

  const remainingMs = nextDueDate.getTime() - today.getTime();
  const remaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  if (remaining < 0) {
    return {
      status: {
        variant: 'overdue',
        label: `Overdue by ${Math.abs(remaining)} days`,
      },
      remaining,
    };
  }

  if (remaining <= warningThresholdDays) {
    return {
      status: {
        variant: 'warning',
        label: `Change in ${remaining} days`,
      },
      remaining,
    };
  }

  return {
    status: {
      variant: 'normal',
      label: `Change in ${remaining} days`,
    },
    remaining,
  };
}

function fmt(value: number): string {
  return Math.abs(value).toLocaleString();
}

/** Parses a YYYY-MM-DD string as local midnight, avoiding UTC shift from `new Date(string)`. */
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  return new Date(dateStr);
}
