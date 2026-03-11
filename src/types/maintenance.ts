export type MaintenanceCategoryId =
  | 'engine'
  | 'transmission'
  | 'fluids'
  | 'brakes'
  | 'wheels'
  | 'electrical'
  | 'hvac'
  | 'other';

export type MaintenanceCategory = {
  id: MaintenanceCategoryId;
  name: string;
  icon: string;
};

export type MaintenanceItem = {
  id: string;
  categoryId: MaintenanceCategoryId;
  name: string;
  statusText: string;
};
