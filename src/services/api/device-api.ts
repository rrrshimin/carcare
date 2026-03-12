import type { Tables, TablesInsert } from '@/types/database';

import { supabase } from './supabase-client';

export type UserDeviceRow = Tables<'user_devices'>;

export async function getDeviceByDeviceId(
  deviceId: string,
): Promise<UserDeviceRow | null> {
  const { data, error } = await supabase
    .from('user_devices')
    .select('*')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createDeviceRecord(
  deviceId: string,
): Promise<UserDeviceRow> {
  const row: TablesInsert<'user_devices'> = {
    device_id: deviceId,
    subscription_status: 'free',
    unit: 'km',
  };

  const { data, error } = await supabase
    .from('user_devices')
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDeviceUnit(
  deviceId: string,
  unit: string,
): Promise<void> {
  const { error } = await supabase
    .from('user_devices')
    .update({ unit })
    .eq('device_id', deviceId);

  if (error) throw error;
}
