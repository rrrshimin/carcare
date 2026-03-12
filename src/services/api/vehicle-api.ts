import type { Tables, TablesInsert } from '@/types/database';

import { supabase } from './supabase-client';

export type VehicleRow = Tables<'vehicles'>;

export async function getVehicleByDeviceId(
  deviceId: string,
): Promise<VehicleRow | null> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id_link', deviceId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createVehicleRecord(
  payload: Pick<
    TablesInsert<'vehicles'>,
    'name' | 'year' | 'fuel_type' | 'transmission' | 'current_odometer' | 'image_url' | 'user_id_link'
  >,
): Promise<VehicleRow> {
  const { data, error } = await supabase
    .from('vehicles')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVehicleOdometer(
  vehicleId: number,
  newOdometer: number,
): Promise<VehicleRow> {
  const { data, error } = await supabase
    .from('vehicles')
    .update({ current_odometer: newOdometer })
    .eq('id', vehicleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVehicleShareLink(
  vehicleId: number,
  slug: string,
): Promise<VehicleRow> {
  const { data, error } = await supabase
    .from('vehicles')
    .update({ shared_link: slug })
    .eq('id', vehicleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function clearVehicleShareLink(
  vehicleId: number,
): Promise<VehicleRow> {
  const { data, error } = await supabase
    .from('vehicles')
    .update({ shared_link: null })
    .eq('id', vehicleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
