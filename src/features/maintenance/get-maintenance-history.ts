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
  costAmount: number | null;
  createdByAuthId: string | null;
};

export type MaintenanceHistoryViewModel = {
  vehicleId: number;
  logTypeName: string;
  specLabel: string;
  dueStatus: MaintenanceItemStatus;
  unit: string;
  currencySymbol: string;
  categoryIconUrl: string | null;
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
  categoryIconUrl: string | null = null,
  currencySymbol: string = '$',
): MaintenanceHistoryViewModel {
  const logTypeName = logType.log_type_name ?? 'Unknown';
  const specLabel = logType.spec_name ?? 'Specification';

  const entries: HistoryLogEntry[] = logs.map((log) => ({
    id: log.id,
    specification: log.specs,
    mileage: log.odo_log,
    date: log.change_date,
    notes: log.notes,
    costAmount: log.cost_amount ?? null,
    createdByAuthId: log.created_by_auth_id ?? null,
  }));

  const sortBy = logType.due_type === 'time' ? 'date' : 'mileage' as const;
  const latestLog = getLatestLog(logs, logType.id, vehicleId, sortBy);
  const result = computeDueStatus(logType, latestLog, currentOdometer, fuelType, unit);

  return {
    vehicleId,
    logTypeName,
    specLabel,
    dueStatus: result?.status ?? NEUTRAL_STATUS,
    unit,
    currencySymbol,
    categoryIconUrl,
    entries,
  };
}
