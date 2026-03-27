import type { VehicleRow } from '@/services/api/vehicle-api';
import type { UserLogRow } from '@/services/api/user-log-api';
import type { LogTypeRow } from '@/services/api/log-type-api';
import type { LogCategoryRow } from '@/services/api/category-api';

export type FleetDataSnapshot = {
  vehicles: VehicleRow[];
  logsMap: Record<number, UserLogRow[]>;
  logTypes: LogTypeRow[];
  categories: LogCategoryRow[];
  currencyCode: string | null;
  unit: string;
  timestamp: number;
};

let cached: FleetDataSnapshot | null = null;

const STALE_MS = 5 * 60 * 1000;

export function setFleetDataCache(data: Omit<FleetDataSnapshot, 'timestamp'>): void {
  cached = { ...data, timestamp: Date.now() };
}

export function getFleetDataCache(): FleetDataSnapshot | null {
  return cached;
}

export function isFleetDataFresh(): boolean {
  return cached != null && Date.now() - cached.timestamp < STALE_MS;
}

export function clearFleetDataCache(): void {
  cached = null;
}
