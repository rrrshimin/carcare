import { updateDeviceUnit } from '@/services/api/device-api';
import { uploadVehicleImage } from '@/services/api/storage-api';
import {
  createVehicleRecord,
  getVehicleByDeviceId,
  updateVehicleOdometer,
  type VehicleRow,
} from '@/services/api/vehicle-api';
import { scheduleMileageReminder } from '@/features/notifications/schedule-mileage-reminder';
import { appStorageKeys, getStoredJson, setLastMileageUpdate, setStoredJson } from '@/services/storage-service';
import { getAppState } from '@/store/app-store';
import type { DistanceUnit, FuelType, Transmission } from '@/types/vehicle';

export type CreateVehicleInput = {
  name: string;
  year: number;
  fuelType: FuelType;
  transmission: Transmission;
  currentOdometer: number;
  unit: DistanceUnit;
  imageUri?: string;
};

/**
 * Returns the current vehicle, checking local cache first and falling
 * back to a backend query by device ID.  This ensures the app never
 * misses a vehicle that exists server-side.
 */
export async function getCurrentVehicle(): Promise<VehicleRow | null> {
  const cached = await getStoredJson<VehicleRow>(appStorageKeys.vehicle);
  if (cached) return cached;

  const { deviceId } = getAppState();
  if (!deviceId) return null;

  const remote = await getVehicleByDeviceId(deviceId);
  if (remote) {
    await setStoredJson(appStorageKeys.vehicle, remote);
  }
  return remote;
}

/**
 * Returns true when a vehicle exists for the current device.
 * Checks backend directly using the given deviceId — local cache is
 * only a fast hint; the backend is the source of truth.
 */
export async function vehicleExistsForDevice(deviceId: string): Promise<boolean> {
  const remote = await getVehicleByDeviceId(deviceId);
  if (remote) {
    await setStoredJson(appStorageKeys.vehicle, remote);
    return true;
  }
  return false;
}

export async function createVehicle(
  input: CreateVehicleInput,
): Promise<VehicleRow> {
  const { deviceId } = getAppState();
  if (!deviceId) {
    throw new Error('Device identity not established.');
  }

  let imageUrl: string | null = null;
  if (input.imageUri) {
    imageUrl = await uploadVehicleImage(input.imageUri);
  }

  const vehicle = await createVehicleRecord({
    name: input.name.trim(),
    year: input.year,
    fuel_type: input.fuelType,
    transmission: input.transmission,
    current_odometer: input.currentOdometer,
    image_url: imageUrl,
    user_id_link: deviceId,
  });

  await setStoredJson(appStorageKeys.vehicle, vehicle);

  await updateDeviceUnit(deviceId, input.unit).catch(() => {
    /* non-critical — default unit is fine for MVP */
  });

  // Seed initial mileage reminder so users get notified even if they
  // never manually update mileage after creating the vehicle.
  const now = new Date().toISOString();
  await setLastMileageUpdate(now).catch(() => {});
  scheduleMileageReminder(now).catch(() => {});

  return vehicle;
}

// ── Update Mileage ──────────────────────────────────────────────────

export type MileageValidationError = {
  message: string;
};

export function validateMileageInput(
  raw: string,
  currentOdometer: number,
): MileageValidationError | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { message: 'Mileage value is required.' };
  }

  const value = Number(trimmed);
  if (isNaN(value)) {
    return { message: 'Mileage must be a number.' };
  }
  if (value < 0) {
    return { message: 'Mileage cannot be negative.' };
  }
  if (value < currentOdometer) {
    return { message: `Mileage cannot be lower than current value (${currentOdometer.toLocaleString()}).` };
  }

  return null;
}

export async function updateMileage(
  vehicleId: number,
  newOdometer: number,
): Promise<VehicleRow> {
  const updated = await updateVehicleOdometer(vehicleId, newOdometer);
  await setStoredJson(appStorageKeys.vehicle, updated);

  const now = new Date().toISOString();
  await setLastMileageUpdate(now).catch(() => {});
  scheduleMileageReminder(now).catch(() => {});

  return updated;
}
