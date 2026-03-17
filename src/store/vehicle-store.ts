export type VehicleStoreState = {
  activeVehicleId: number | null;
  vehicleCount: number;
};

let state: VehicleStoreState = {
  activeVehicleId: null,
  vehicleCount: 0,
};

export function getVehicleStore(): Readonly<VehicleStoreState> {
  return state;
}

export function setActiveVehicleId(id: number | null): void {
  state = { ...state, activeVehicleId: id };
}

export function setVehicleCount(count: number): void {
  state = { ...state, vehicleCount: count };
}

export function resetVehicleStore(): void {
  state = { activeVehicleId: null, vehicleCount: 0 };
}
