import { MaintenanceCategory, MaintenanceItem } from '@/types/maintenance';

export const maintenanceCategories: MaintenanceCategory[] = [
  { id: 'engine', name: 'Engine', icon: 'EN' },
  { id: 'transmission', name: 'Transmission', icon: 'TR' },
  { id: 'fluids', name: 'Fluids', icon: 'FL' },
  { id: 'brakes', name: 'Brakes', icon: 'BR' },
  { id: 'wheels', name: 'Wheels', icon: 'WH' },
  { id: 'electrical', name: 'Electrical', icon: 'EL' },
  { id: 'hvac', name: 'HVAC', icon: 'HV' },
  { id: 'other', name: 'Other', icon: 'OT' },
];

export const maintenanceItems: MaintenanceItem[] = [
  { id: 'engine-oil', categoryId: 'engine', name: 'Engine Oil', statusText: 'Service status pending' },
  { id: 'oil-filter', categoryId: 'engine', name: 'Oil Filter', statusText: 'Service status pending' },
  {
    id: 'transmission-fluid',
    categoryId: 'transmission',
    name: 'Transmission Fluid',
    statusText: 'Service status pending',
  },
  { id: 'coolant', categoryId: 'fluids', name: 'Coolant', statusText: 'Service status pending' },
  { id: 'brake-pads', categoryId: 'brakes', name: 'Brake Pads', statusText: 'Service status pending' },
  { id: 'tire-rotation', categoryId: 'wheels', name: 'Tire Rotation', statusText: 'Service status pending' },
  { id: 'battery', categoryId: 'electrical', name: 'Battery', statusText: 'Service status pending' },
  { id: 'cabin-filter', categoryId: 'hvac', name: 'Cabin Filter', statusText: 'Service status pending' },
  { id: 'general-check', categoryId: 'other', name: 'General Check', statusText: 'Service status pending' },
];
