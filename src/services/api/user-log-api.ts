import type { Tables, TablesInsert } from '@/types/database';

import { supabase } from './supabase-client';

export type UserLogRow = Tables<'user_logs'>;

export async function getLogsByVehicleId(
  vehicleId: number,
): Promise<UserLogRow[]> {
  const { data, error } = await supabase
    .from('user_logs')
    .select('*')
    .eq('car_id', vehicleId)
    .order('change_date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getLogsByVehicleAndLogType(
  vehicleId: number,
  logTypeId: number,
): Promise<UserLogRow[]> {
  const { data, error } = await supabase
    .from('user_logs')
    .select('*')
    .eq('car_id', vehicleId)
    .eq('log_type', logTypeId)
    .order('change_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createUserLog(
  payload: Pick<
    TablesInsert<'user_logs'>,
    'car_id' | 'log_type' | 'odo_log' | 'change_date' | 'specs' | 'notes'
  >,
): Promise<UserLogRow> {
  const { data, error } = await supabase
    .from('user_logs')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}
