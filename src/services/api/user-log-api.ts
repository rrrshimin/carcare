import type { Tables, TablesInsert } from '@/types/database';

import { supabase } from './supabase-client';

export type UserLogRow = Tables<'user_logs'>;

export async function getLogsByVehicleId(
  vehicleId: number,
  deviceId?: string,
): Promise<UserLogRow[]> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user?.id) {
    const { data, error } = await supabase
      .from('user_logs')
      .select('*')
      .eq('car_id', vehicleId)
      .order('change_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  if (!deviceId) throw new Error('deviceId required for guest log access');
  const { data, error } = await supabase.rpc('get_guest_logs', {
    p_device_id: deviceId,
    p_vehicle_id: vehicleId,
  });
  if (error) throw new Error(error.message);
  return (data as UserLogRow[] | null) ?? [];
}

export async function getLogsByVehicleAndLogType(
  vehicleId: number,
  logTypeId: number,
  deviceId?: string,
): Promise<UserLogRow[]> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user?.id) {
    const { data, error } = await supabase
      .from('user_logs')
      .select('*')
      .eq('car_id', vehicleId)
      .eq('log_type', logTypeId)
      .order('change_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  if (!deviceId) throw new Error('deviceId required for guest log access');
  const { data, error } = await supabase.rpc('get_guest_logs_by_type', {
    p_device_id: deviceId,
    p_vehicle_id: vehicleId,
    p_log_type_id: logTypeId,
  });
  if (error) throw new Error(error.message);
  return (data as UserLogRow[] | null) ?? [];
}

export async function deleteUserLog(
  logId: number,
  vehicleId: number,
  deviceId?: string,
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user?.id) {
    const { error } = await supabase
      .from('user_logs')
      .delete()
      .eq('id', logId)
      .eq('car_id', vehicleId);
    if (error) throw new Error(error.message);
    return;
  }

  if (!deviceId) throw new Error('deviceId required for guest log access');
  const { error } = await supabase.rpc('delete_guest_log', {
    p_device_id: deviceId,
    p_log_id: logId,
  });
  if (error) throw new Error(error.message);
}

export async function createUserLog(
  payload: Pick<
    TablesInsert<'user_logs'>,
    'car_id' | 'log_type' | 'odo_log' | 'change_date' | 'specs' | 'notes'
  >,
  deviceId?: string,
): Promise<UserLogRow> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user?.id) {
    const { data, error } = await supabase
      .from('user_logs')
      .insert({ ...payload, created_by_auth_id: session.user.id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (!deviceId) throw new Error('deviceId required for guest log access');
  const { data, error } = await supabase.rpc('create_guest_log', {
    p_device_id: deviceId,
    p_car_id: payload.car_id!,
    p_log_type: payload.log_type!,
    p_odo_log: payload.odo_log ?? undefined,
    p_change_date: payload.change_date ?? undefined,
    p_specs: payload.specs ?? undefined,
    p_notes: payload.notes ?? undefined,
  });
  if (error) throw new Error(error.message);
  const rows = data as UserLogRow[] | null;
  if (!rows?.length) throw new Error('create_guest_log returned no rows');
  return rows[0];
}
