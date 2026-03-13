// Legacy static-catalog types below (MaintenanceCategoryId, MaintenanceCategory, MaintenanceItem).
// The app now reads categories and items from the backend tables log_categories / log_types.
// These types are retained for potential offline-fallback use but are not actively imported.
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
  dueType: 'mileage' | 'time';
  baseDue: number;
  dieselIncrement: number;
  hybridIncrement: number;
  specName?: string;
  specPlaceholder?: string;
};

export type MaintenanceStatusVariant = 'neutral' | 'normal' | 'warning' | 'overdue';

export type MaintenanceItemStatus = {
  variant: MaintenanceStatusVariant;
  label: string;
};

// Display-level types shared between the summary layer and UI components.

export type CategoryDisplay = {
  id: number;
  name: string;
  iconUrl: string | null;
};

export type ItemDisplay = {
  id: number;
  name: string;
  status: MaintenanceItemStatus;
};
