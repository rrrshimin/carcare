import type { Tables, TablesInsert } from '@/types/database';

import { supabase } from './supabase-client';

export type VehicleRow = Tables<'vehicles'>;

// ── Helpers ──────────────────────────────────────────────────────────

async function isAuthenticated(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

// ── Read ─────────────────────────────────────────────────────────────

export async function getVehicleByDeviceId(
  deviceId: string,
): Promise<VehicleRow | null> {
  const uid = await isAuthenticated();

  if (uid) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('auth_user_id', uid)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase.rpc('get_guest_vehicles', {
    p_device_id: deviceId,
  });
  if (error) throw new Error(error.message);
  return (data as VehicleRow[] | null)?.[0] ?? null;
}

export async function getAllVehiclesForUser(
  deviceId: string,
): Promise<VehicleRow[]> {
  const uid = await isAuthenticated();

  if (uid) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('auth_user_id', uid)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  const { data, error } = await supabase.rpc('get_guest_vehicles', {
    p_device_id: deviceId,
  });
  if (error) throw new Error(error.message);
  return (data as VehicleRow[] | null) ?? [];
}

export async function getVehicleById(
  vehicleId: number,
  deviceId?: string,
): Promise<VehicleRow | null> {
  const uid = await isAuthenticated();

  if (uid) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .eq('auth_user_id', uid)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  if (!deviceId) throw new Error('deviceId required for guest vehicle access');
  const { data, error } = await supabase.rpc('get_guest_vehicle', {
    p_device_id: deviceId,
    p_vehicle_id: vehicleId,
  });
  if (error) throw new Error(error.message);
  return (data as VehicleRow[] | null)?.[0] ?? null;
}

// ── Create ───────────────────────────────────────────────────────────

export async function createVehicleRecord(
  payload: Pick<
    TablesInsert<'vehicles'>,
    'name' | 'year' | 'fuel_type' | 'transmission' | 'current_odometer' | 'image_url' | 'user_id_link'
  >,
): Promise<VehicleRow> {
  const uid = await isAuthenticated();

  if (uid) {
    const row: TablesInsert<'vehicles'> = {
      ...payload,
      auth_user_id: uid,
    };
    const { data, error } = await supabase
      .from('vehicles')
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase.rpc('create_guest_vehicle', {
    p_device_id: payload.user_id_link!,
    p_name: payload.name!,
    p_year: payload.year!,
    p_fuel_type: payload.fuel_type!,
    p_transmission: payload.transmission!,
    p_current_odometer: payload.current_odometer!,
    p_image_url: payload.image_url ?? undefined,
  });
  if (error) throw new Error(error.message);
  const rows = data as VehicleRow[] | null;
  if (!rows?.length) throw new Error('create_guest_vehicle returned no rows');
  return rows[0];
}

// ── Update ───────────────────────────────────────────────────────────

export async function updateVehicleOdometer(
  vehicleId: number,
  newOdometer: number,
  deviceId?: string,
): Promise<VehicleRow> {
  const uid = await isAuthenticated();

  if (uid) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({ current_odometer: newOdometer })
      .eq('id', vehicleId)
      .eq('auth_user_id', uid)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (!deviceId) throw new Error('deviceId required for guest vehicle access');
  const { data, error } = await supabase.rpc('update_guest_vehicle_odometer', {
    p_device_id: deviceId,
    p_vehicle_id: vehicleId,
    p_odometer: newOdometer,
  });
  if (error) throw new Error(error.message);
  const rows = data as VehicleRow[] | null;
  if (!rows?.length) throw new Error('update_guest_vehicle_odometer returned no rows');
  return rows[0];
}

export async function updateVehicleShareLink(
  vehicleId: number,
  slug: string,
  deviceId?: string,
): Promise<VehicleRow> {
  const uid = await isAuthenticated();

  if (uid) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({ shared_link: slug })
      .eq('id', vehicleId)
      .eq('auth_user_id', uid)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (!deviceId) throw new Error('deviceId required for guest vehicle access');
  const { data, error } = await supabase.rpc('set_guest_share_link', {
    p_device_id: deviceId,
    p_vehicle_id: vehicleId,
    p_slug: slug,
  });
  if (error) throw new Error(error.message);
  const rows = data as VehicleRow[] | null;
  if (!rows?.length) throw new Error('set_guest_share_link returned no rows');
  return rows[0];
}

export async function clearVehicleShareLink(
  vehicleId: number,
  deviceId?: string,
): Promise<VehicleRow> {
  const uid = await isAuthenticated();

  if (uid) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({ shared_link: null })
      .eq('id', vehicleId)
      .eq('auth_user_id', uid)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (!deviceId) throw new Error('deviceId required for guest vehicle access');
  const { data, error } = await supabase.rpc('set_guest_share_link', {
    p_device_id: deviceId,
    p_vehicle_id: vehicleId,
  });
  if (error) throw new Error(error.message);
  const rows = data as VehicleRow[] | null;
  if (!rows?.length) throw new Error('set_guest_share_link returned no rows');
  return rows[0];
}

// ── Update Profile (name / image) ────────────────────────────────────

export async function updateVehicleProfile(
  vehicleId: number,
  fields: { name?: string; image_url?: string | null },
  deviceId?: string,
): Promise<VehicleRow> {
  const uid = await isAuthenticated();

  if (uid) {
    const patch: Record<string, unknown> = {};
    if (fields.name !== undefined) patch.name = fields.name;
    if (fields.image_url !== undefined) patch.image_url = fields.image_url;

    const { data, error } = await supabase
      .from('vehicles')
      .update(patch)
      .eq('id', vehicleId)
      .eq('auth_user_id', uid)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (!deviceId) throw new Error('deviceId required for guest vehicle access');
  const { data, error } = await supabase.rpc('update_guest_vehicle_profile', {
    p_device_id: deviceId,
    p_vehicle_id: vehicleId,
    p_name: fields.name ?? undefined,
    p_image_url: fields.image_url ?? undefined,
  });
  if (error) throw new Error(error.message);
  const rows = data as VehicleRow[] | null;
  if (!rows?.length) throw new Error('update_guest_vehicle_profile returned no rows');
  return rows[0];
}

// ── Delete ───────────────────────────────────────────────────────────

export async function deleteVehicleRecord(
  vehicleId: number,
  deviceId?: string,
): Promise<void> {
  const uid = await isAuthenticated();

  if (uid) {
    const { error: logsError } = await supabase
      .from('user_logs')
      .delete()
      .eq('car_id', vehicleId);
    if (logsError) throw new Error(logsError.message);

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
      .eq('auth_user_id', uid);
    if (error) throw new Error(error.message);
    return;
  }

  if (!deviceId) throw new Error('deviceId required for guest vehicle access');
  const { error } = await supabase.rpc('delete_guest_vehicle', {
    p_device_id: deviceId,
    p_vehicle_id: vehicleId,
  });
  if (error) throw new Error(error.message);
}

// ── Claim ────────────────────────────────────────────────────────────

/**
 * Claims all unclaimed vehicles on this device for the authenticated user.
 * The RPC uses auth.uid() internally — caller must be authenticated.
 */
export async function claimGuestVehicles(
  deviceId: string,
): Promise<void> {
  const { error } = await supabase.rpc('claim_guest_vehicles', {
    p_device_id: deviceId,
  });
  if (error) throw new Error(error.message);
}
