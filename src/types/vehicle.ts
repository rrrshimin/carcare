export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';

export type Transmission = 'automatic' | 'manual';

export type DistanceUnit = 'km' | 'mi';

export type Vehicle = {
  id: string;
  name: string;
  year: number;
  fuelType: FuelType;
  transmission: Transmission;
  currentOdometer: number;
  unit: DistanceUnit;
  imageUri?: string;
  createdAt: string;
};
