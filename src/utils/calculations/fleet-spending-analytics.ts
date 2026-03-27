import type { UserLogRow } from '@/services/api/user-log-api';
import type { LogTypeRow } from '@/services/api/log-type-api';
import type { LogCategoryRow } from '@/services/api/category-api';
import type { VehicleRow } from '@/services/api/vehicle-api';

// ── Types ────────────────────────────────────────────────────────────

export type MonthlyTotal = {
  month: string;
  label: string;
  total: number;
};

export type FleetCategoryTotal = {
  categoryId: number;
  categoryName: string;
  iconUrl: string | null;
  total: number;
};

export type FleetVehicleSummary = {
  vehicleId: number;
  vehicleName: string;
  vehicleYear: number | null;
  vehicleImageUrl: string | null;
  total: number;
  recentLogs: FleetVehicleLog[];
};

export type FleetVehicleLog = {
  logId: number;
  logTypeName: string;
  date: string;
  cost: number;
};

export type FleetExportRow = {
  vehicleName: string;
  vehicleYear: number | null;
  currentMileage: number | null;
  category: string;
  logType: string;
  changeDate: string;
  cost: number;
  specs: string;
  notes: string;
};

type VehicleWithLogs = {
  vehicle: VehicleRow;
  logs: UserLogRow[];
};

// ── Helpers ──────────────────────────────────────────────────────────

const MAX_EXPANDED_LOGS = 5;

function getCostedLogs(logs: UserLogRow[]): UserLogRow[] {
  return logs.filter(
    (l) => l.cost_amount != null && l.cost_amount > 0 && l.change_date,
  );
}

function mergeAllLogs(vehiclesWithLogs: VehicleWithLogs[]): UserLogRow[] {
  const all: UserLogRow[] = [];
  for (const { logs } of vehiclesWithLogs) {
    for (const log of logs) all.push(log);
  }
  return all;
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function monthLabel(yyyyMm: string): string {
  const idx = parseInt(yyyyMm.split('-')[1], 10) - 1;
  return MONTH_LABELS[idx] ?? yyyyMm;
}

function parseMonth(dateStr: string): string {
  return dateStr.substring(0, 7);
}

// ── Public functions ─────────────────────────────────────────────────

export function computeFleetYearMonthlyTotals(
  vehiclesWithLogs: VehicleWithLogs[],
  year: number,
): MonthlyTotal[] {
  const costed = getCostedLogs(mergeAllLogs(vehiclesWithLogs));
  const yearStr = String(year);

  const months: string[] = [];
  for (let m = 1; m <= 12; m++) {
    months.push(`${yearStr}-${String(m).padStart(2, '0')}`);
  }

  const sums = new Map<string, number>();
  for (const key of months) sums.set(key, 0);

  for (const log of costed) {
    const key = parseMonth(log.change_date!);
    if (sums.has(key)) {
      sums.set(key, sums.get(key)! + log.cost_amount!);
    }
  }

  return months.map((m) => ({
    month: m,
    label: monthLabel(m),
    total: Math.round((sums.get(m) ?? 0) * 100) / 100,
  }));
}

export function computeFleetYearSpending(
  vehiclesWithLogs: VehicleWithLogs[],
  year: number,
): { total: number; count: number } {
  const yearStr = String(year);
  const costed = getCostedLogs(mergeAllLogs(vehiclesWithLogs));
  let total = 0;
  let count = 0;
  for (const log of costed) {
    if (log.change_date!.startsWith(yearStr)) {
      total += log.cost_amount!;
      count++;
    }
  }
  return { total: Math.round(total * 100) / 100, count };
}

export function computeFleetThisMonthSpending(
  vehiclesWithLogs: VehicleWithLogs[],
): { total: number; count: number } {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const costed = getCostedLogs(mergeAllLogs(vehiclesWithLogs));
  let total = 0;
  let count = 0;
  for (const log of costed) {
    if (parseMonth(log.change_date!) === currentMonth) {
      total += log.cost_amount!;
      count++;
    }
  }
  return { total: Math.round(total * 100) / 100, count };
}

export function computeFleetCategoryBreakdown(
  vehiclesWithLogs: VehicleWithLogs[],
  logTypes: LogTypeRow[],
  categories: LogCategoryRow[],
  year: number,
): FleetCategoryTotal[] {
  const yearStr = String(year);
  const costed = getCostedLogs(mergeAllLogs(vehiclesWithLogs)).filter(
    (l) => l.change_date!.startsWith(yearStr),
  );
  if (costed.length === 0) return [];

  const logTypeToCategory = new Map<number, number>();
  for (const lt of logTypes) {
    if (lt.category_link != null) logTypeToCategory.set(lt.id, lt.category_link);
  }

  const catInfo = new Map<number, { name: string; iconUrl: string | null }>();
  for (const c of categories) {
    catInfo.set(c.id, { name: c.category_name ?? 'Other', iconUrl: c.image_url ?? null });
  }

  const sums = new Map<number, number>();
  for (const log of costed) {
    const catId = logTypeToCategory.get(log.log_type ?? -1);
    if (catId == null) continue;
    sums.set(catId, (sums.get(catId) ?? 0) + log.cost_amount!);
  }

  return Array.from(sums.entries())
    .map(([catId, total]) => {
      const info = catInfo.get(catId);
      return {
        categoryId: catId,
        categoryName: info?.name ?? 'Other',
        iconUrl: info?.iconUrl ?? null,
        total: Math.round(total * 100) / 100,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function computeFleetVehicleBreakdown(
  vehiclesWithLogs: VehicleWithLogs[],
  logTypes: LogTypeRow[],
  year: number,
): FleetVehicleSummary[] {
  const yearStr = String(year);
  const logTypeMap = new Map<number, LogTypeRow>();
  for (const lt of logTypes) logTypeMap.set(lt.id, lt);

  return vehiclesWithLogs
    .map(({ vehicle, logs }) => {
      const costed = getCostedLogs(logs).filter(
        (l) => l.change_date!.startsWith(yearStr),
      );

      const total = costed.reduce((s, l) => s + l.cost_amount!, 0);

      const recentLogs: FleetVehicleLog[] = costed
        .sort((a, b) => (b.change_date ?? '').localeCompare(a.change_date ?? ''))
        .slice(0, MAX_EXPANDED_LOGS)
        .map((log) => ({
          logId: log.id,
          logTypeName: logTypeMap.get(log.log_type ?? -1)?.log_type_name ?? 'Service',
          date: log.change_date ?? '',
          cost: log.cost_amount!,
        }));

      return {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name ?? 'Vehicle',
        vehicleYear: vehicle.year,
        vehicleImageUrl: vehicle.image_url,
        total: Math.round(total * 100) / 100,
        recentLogs,
      };
    })
    .filter((v) => v.total > 0)
    .sort((a, b) => b.total - a.total);
}

export function computeFleetExportRows(
  vehiclesWithLogs: VehicleWithLogs[],
  logTypes: LogTypeRow[],
  categories: LogCategoryRow[],
  startDate: string,
  endDate: string,
): FleetExportRow[] {
  const logTypeMap = new Map<number, LogTypeRow>();
  for (const lt of logTypes) logTypeMap.set(lt.id, lt);

  const categoryMap = new Map<number, string>();
  for (const c of categories) categoryMap.set(c.id, c.category_name ?? 'Other');

  const rows: FleetExportRow[] = [];

  for (const { vehicle, logs } of vehiclesWithLogs) {
    const costed = getCostedLogs(logs).filter((l) => {
      const d = l.change_date!;
      return d >= startDate && d <= endDate;
    });

    for (const log of costed) {
      const lt = logTypeMap.get(log.log_type ?? -1);
      const catName = lt?.category_link
        ? categoryMap.get(lt.category_link) ?? 'Other'
        : 'Other';

      rows.push({
        vehicleName: vehicle.name ?? 'Vehicle',
        vehicleYear: vehicle.year,
        currentMileage: vehicle.current_odometer,
        category: catName,
        logType: lt?.log_type_name ?? 'Service',
        changeDate: log.change_date ?? '',
        cost: log.cost_amount!,
        specs: log.specs ?? '',
        notes: log.notes ?? '',
      });
    }
  }

  return rows.sort((a, b) => b.changeDate.localeCompare(a.changeDate));
}
