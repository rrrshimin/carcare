import AsyncStorage from '@react-native-async-storage/async-storage';

import { updateDeviceUnit } from '@/services/api/device-api';
import { uploadVehicleImage } from '@/services/api/storage-api';
import {
  createVehicleRecord,
  deleteVehicleRecord,
  getAllVehiclesForUser,
  getVehicleByDeviceId,
  getVehicleById,
  updateVehicleOdometer,
  updateVehicleProfile,
  type VehicleRow,
} from '@/services/api/vehicle-api';
import { getLogsByVehicleId } from '@/services/api/user-log-api';
import { scheduleMileageReminder } from '@/features/notifications/schedule-mileage-reminder';
import { appStorageKeys, getStoredJson, setLastMileageUpdate, setStoredJson } from '@/services/storage-service';
import { getAppState } from '@/store/app-store';
import { setActiveVehicleId, setVehicleCount, getVehicleStore } from '@/store/vehicle-store';
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
 * Removes the locally cached vehicle so the next fetch hits the backend.
 * Called on auth state transitions (sign-in claim, sign-out) to prevent
 * stale ownership data from being served. Also resets the active vehicle
 * store so multi-car state doesn't leak across sessions.
 */
export async function clearVehicleCache(): Promise<void> {
  setActiveVehicleId(null);
  setVehicleCount(0);
  await AsyncStorage.removeItem(appStorageKeys.vehicle);
}

/**
 * Returns the current vehicle, checking local cache first and falling
 * back to a backend query by device ID.  This ensures the app never
 * misses a vehicle that exists server-side.
 *
 * Pass `skipCache: true` after auth state transitions so the backend
 * ownership query is always used instead of a potentially stale cache.
 */
export async function getCurrentVehicle(
  options?: { skipCache?: boolean },
): Promise<VehicleRow | null> {
  if (!options?.skipCache) {
    const cached = await getStoredJson<VehicleRow>(appStorageKeys.vehicle);
    if (cached) return cached;
  }

  const { deviceId } = getAppState();
  if (!deviceId) return null;

  const remote = await getVehicleByDeviceId(deviceId);
  if (remote) {
    await setStoredJson(appStorageKeys.vehicle, remote);
  } else {
    await AsyncStorage.removeItem(appStorageKeys.vehicle);
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
  return !!remote;
}

/**
 * Fetches all vehicles and updates the vehicle store with count.
 * Returns the full array so callers can inspect it.
 */
export async function getAllVehicles(): Promise<VehicleRow[]> {
  const { deviceId } = getAppState();
  if (!deviceId) return [];

  const vehicles = await getAllVehiclesForUser(deviceId);
  setVehicleCount(vehicles.length);

  if (vehicles.length === 1) {
    setActiveVehicleId(vehicles[0].id);
    await setStoredJson(appStorageKeys.vehicle, vehicles[0]);
  }

  return vehicles;
}

/**
 * Returns the vehicle count for the current user/device and stores it.
 */
export async function getVehicleCountForDevice(deviceId: string): Promise<number> {
  const vehicles = await getAllVehiclesForUser(deviceId);
  setVehicleCount(vehicles.length);

  if (vehicles.length === 1) {
    setActiveVehicleId(vehicles[0].id);
    await setStoredJson(appStorageKeys.vehicle, vehicles[0]);
  } else if (vehicles.length > 1) {
    const { activeVehicleId } = getVehicleStore();
    if (!activeVehicleId) {
      setActiveVehicleId(vehicles[0].id);
    }
    const resolvedId = activeVehicleId ?? vehicles[0].id;
    const toCache = vehicles.find((v) => v.id === resolvedId) ?? vehicles[0];
    await setStoredJson(appStorageKeys.vehicle, toCache);
  }

  return vehicles.length;
}

/**
 * Loads a specific vehicle by ID. Used when the active vehicle is set
 * (multi-car mode). Falls back to getVehicleByDeviceId for single-car.
 */
export async function getActiveVehicle(): Promise<VehicleRow | null> {
  const { activeVehicleId } = getVehicleStore();

  if (activeVehicleId) {
    const { deviceId } = getAppState();
    const vehicle = await getVehicleById(activeVehicleId, deviceId ?? undefined);
    if (vehicle) {
      await setStoredJson(appStorageKeys.vehicle, vehicle);
      return vehicle;
    }
  }

  return getCurrentVehicle();
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

  const now = new Date().toISOString();
  await setLastMileageUpdate(now, vehicle.id).catch(() => {});
  scheduleMileageReminder(now).catch(() => {});

  return vehicle;
}

// ── Edit Vehicle (name / image) ─────────────────────────────────────

export type EditVehicleInput = {
  name?: string;
  imageUri?: string;
};

/**
 * Updates a vehicle's display name and/or photo, then refreshes the
 * local cache so all screens see the new data immediately.
 */
export async function editVehicle(
  vehicleId: number,
  input: EditVehicleInput,
): Promise<VehicleRow> {
  const { deviceId } = getAppState();
  if (!deviceId) throw new Error('Device identity not established.');

  let imageUrl: string | undefined;
  if (input.imageUri) {
    imageUrl = await uploadVehicleImage(input.imageUri);
  }

  const fields: { name?: string; image_url?: string } = {};
  if (input.name !== undefined) fields.name = input.name.trim();
  if (imageUrl !== undefined) fields.image_url = imageUrl;

  const updated = await updateVehicleProfile(vehicleId, fields, deviceId);
  await setStoredJson(appStorageKeys.vehicle, updated);
  return updated;
}

// ── Delete Vehicle ──────────────────────────────────────────────────

/**
 * Deletes a vehicle and all its related logs, then updates local state.
 * Returns the number of remaining vehicles so callers can decide routing.
 */
export async function deleteVehicle(vehicleId: number): Promise<number> {
  const { deviceId } = getAppState();
  if (!deviceId) throw new Error('Device identity not established.');

  await deleteVehicleRecord(vehicleId, deviceId);

  await AsyncStorage.removeItem(appStorageKeys.vehicle);

  const mileageKey = `${appStorageKeys.lastMileageUpdate}.${vehicleId}`;
  await AsyncStorage.removeItem(mileageKey).catch(() => {});

  const remaining = await getAllVehiclesForUser(deviceId);
  setVehicleCount(remaining.length);

  if (remaining.length === 0) {
    setActiveVehicleId(null);
  } else if (getVehicleStore().activeVehicleId === vehicleId) {
    setActiveVehicleId(remaining[0].id);
    await setStoredJson(appStorageKeys.vehicle, remaining[0]);
  }

  return remaining.length;
}

// ── Update Mileage ──────────────────────────────────────────────────

/**
 * Returns the highest odo_log value among all logs for a given vehicle.
 * Returns 0 if there are no logs or no log has a mileage value.
 */
export async function getMaxLogMileage(vehicleId: number): Promise<number> {
  const { deviceId } = getAppState();
  const logs = await getLogsByVehicleId(vehicleId, deviceId ?? undefined);
  let max = 0;
  for (const log of logs) {
    if (log.odo_log != null && log.odo_log > max) {
      max = log.odo_log;
    }
  }
  return max;
}

export type MileageValidationError = {
  message: string;
};

export function validateMileageInput(
  raw: string,
  maxLogMileage: number,
): MileageValidationError | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { message: 'Mileage value is required.' };
  }

  const value = Number(trimmed);
  if (isNaN(value) || !Number.isInteger(value)) {
    return { message: 'Mileage must be a whole number.' };
  }
  if (value < 0) {
    return { message: 'Mileage cannot be negative.' };
  }
  if (value > 1_000_000) {
    return { message: 'Mileage cannot exceed 1,000,000.' };
  }
  if (maxLogMileage > 0 && value < maxLogMileage) {
    return {
      message: `Mileage cannot be lower than the highest log entry (${maxLogMileage.toLocaleString()}). Delete that log first if it was a mistake.`,
    };
  }

  return null;
}

export async function updateMileage(
  vehicleId: number,
  newOdometer: number,
): Promise<VehicleRow> {
  const { deviceId } = getAppState();
  const updated = await updateVehicleOdometer(vehicleId, newOdometer, deviceId ?? undefined);
  await setStoredJson(appStorageKeys.vehicle, updated);

  const now = new Date().toISOString();
  await setLastMileageUpdate(now, vehicleId).catch(() => {});
  scheduleMileageReminder(now).catch(() => {});

  return updated;
}
