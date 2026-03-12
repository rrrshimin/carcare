import {
  clearVehicleShareLink,
  updateVehicleShareLink,
  type VehicleRow,
} from '@/services/api/vehicle-api';
import { appStorageKeys, setStoredJson } from '@/services/storage-service';
import { createShareSlug } from '@/utils/sharing';

export async function enableSharing(vehicleId: number): Promise<VehicleRow> {
  const slug = createShareSlug();
  const updated = await updateVehicleShareLink(vehicleId, slug);
  await setStoredJson(appStorageKeys.vehicle, updated);
  return updated;
}

export async function disableSharing(vehicleId: number): Promise<VehicleRow> {
  const updated = await clearVehicleShareLink(vehicleId);
  await setStoredJson(appStorageKeys.vehicle, updated);
  return updated;
}
