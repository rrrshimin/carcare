import type { LogTypeRow } from '@/services/api/log-type-api';
import type { UserLogRow } from '@/services/api/user-log-api';
import type { MaintenanceItemStatus } from '@/types/maintenance';
import { computeDueStatus, NEUTRAL_STATUS } from '@/utils/calculations/compute-due-status';
import { getLatestLog } from '@/utils/calculations/get-latest-log';

// ── View-model types consumed by the Maintenance History screen ─────

export type HistoryLogEntry = {
  id: number;
  specification: string | null;
  mileage: number | null;
  date: string | null;
  notes: string | null;
};

export type MaintenanceHistoryViewModel = {
  logTypeName: string;
  specLabel: string;
  dueStatus: MaintenanceItemStatus;
  unit: string;
  entries: HistoryLogEntry[];
};

// ── Public API ──────────────────────────────────────────────────────

export function getMaintenanceHistory(
  logType: LogTypeRow,
  logs: UserLogRow[],
  vehicleId: number,
  currentOdometer: number,
  fuelType: string | null,
  unit: string,
): MaintenanceHistoryViewModel {
  const logTypeName = logType.log_type_name ?? 'Unknown';
  const specLabel = logType.spec_name ?? 'Specification';

  const entries: HistoryLogEntry[] = logs.map((log) => ({
    id: log.id,
    specification: log.specs,
    mileage: log.odo_log,
    date: log.change_date,
    notes: log.notes,
  }));

  const latestLog = getLatestLog(logs, logType.id, vehicleId);
  const result = computeDueStatus(logType, latestLog, currentOdometer, fuelType, unit);

  return {
    logTypeName,
    specLabel,
    dueStatus: result?.status ?? NEUTRAL_STATUS,
    unit,
    entries,
  };
}
