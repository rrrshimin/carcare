import {
  clearVehicleShareLink,
  updateVehicleShareLink,
  type VehicleRow,
} from '@/services/api/vehicle-api';
import { appStorageKeys, setStoredJson } from '@/services/storage-service';
import { getAppState } from '@/store/app-store';
import { createShareSlug } from '@/utils/sharing';

export async function enableSharing(vehicleId: number): Promise<VehicleRow> {
  const slug = createShareSlug();
  const { deviceId } = getAppState();
  const updated = await updateVehicleShareLink(vehicleId, slug, deviceId ?? undefined);
  await setStoredJson(appStorageKeys.vehicle, updated);
  return updated;
}

export async function disableSharing(vehicleId: number): Promise<VehicleRow> {
  const { deviceId } = getAppState();
  const updated = await clearVehicleShareLink(vehicleId, deviceId ?? undefined);
  await setStoredJson(appStorageKeys.vehicle, updated);
  return updated;
}
