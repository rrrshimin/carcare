import type { VehicleScreenData } from '@/hooks/use-vehicle-data';
import type { MaintenanceItemStatus } from '@/types/maintenance';
import { computeDueStatus, NEUTRAL_STATUS } from '@/utils/calculations/compute-due-status';
import { getLatestLog } from '@/utils/calculations/get-latest-log';
import { sortMaintenanceItemsByPriority } from '@/utils/calculations/sort-maintenance-items';
import { isLogTypeApplicableToVehicle } from '@/utils/log-type-filter';

// ── View-model types consumed by the Home screen ────────────────────

export type MaintenanceSummaryItem = {
  id: number;
  name: string;
  status: MaintenanceItemStatus;
  remainingValue?: number;
};

export type MaintenanceSummaryCategory = {
  id: number;
  name: string;
  iconUrl: string | null;
  items: MaintenanceSummaryItem[];
};

export type MaintenanceSummary = MaintenanceSummaryCategory[];

// ── Public API ──────────────────────────────────────────────────────

/**
 * Transforms raw Supabase rows into an array of category groups with
 * pre-computed due statuses, ready for the Home screen to render.
 */
export function getMaintenanceSummary(data: VehicleScreenData): MaintenanceSummary {
  const { vehicle, device, categories, logTypes, userLogs } = data;
  const fuelType = vehicle.fuel_type;
  const transmission = vehicle.transmission;
  const currentOdometer = vehicle.current_odometer ?? 0;
  const unit = device.unit ?? 'km';

  return categories
    .map((category) => {
      const typesInCategory = logTypes.filter(
        (lt) =>
          lt.category_link === category.id &&
          isLogTypeApplicableToVehicle(lt, fuelType, transmission),
      );

      const items: MaintenanceSummaryItem[] = typesInCategory.map((logType) => {
        const sortBy = logType.due_type === 'time' ? 'date' : 'mileage' as const;
        const latestLog = getLatestLog(userLogs, logType.id, vehicle.id, sortBy);
        const result = computeDueStatus(logType, latestLog, currentOdometer, fuelType, unit);

        return {
          id: logType.id,
          name: logType.log_type_name ?? 'Unknown',
          status: result?.status ?? NEUTRAL_STATUS,
          remainingValue: result?.remaining,
        };
      });

      const sortedItems = sortMaintenanceItemsByPriority(items);

      return {
        id: category.id,
        name: category.category_name ?? 'Unknown',
        iconUrl: category.image_url ?? null,
        items: sortedItems,
      };
    })
    .filter((group) => group.items.length > 0);
}
