import { appStorageKeys, getStoredJson, setStoredJson } from '@/services/storage-service';
import { Vehicle } from '@/types/vehicle';

export type CreateVehicleInput = {
  name: string;
  year: number;
  fuelType: Vehicle['fuelType'];
  transmission: Vehicle['transmission'];
  currentOdometer: number;
  unit: Vehicle['unit'];
  imageUri?: string;
};

export async function getCurrentVehicle(): Promise<Vehicle | null> {
  return getStoredJson<Vehicle>(appStorageKeys.vehicle);
}

export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  const vehicle: Vehicle = {
    id: `vehicle-${Date.now()}`,
    name: input.name.trim(),
    year: input.year,
    fuelType: input.fuelType,
    transmission: input.transmission,
    currentOdometer: input.currentOdometer,
    unit: input.unit,
    imageUri: input.imageUri?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  await setStoredJson(appStorageKeys.vehicle, vehicle);
  return vehicle;
}
