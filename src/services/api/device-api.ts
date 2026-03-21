import type { Tables } from '@/types/database';

import { supabase } from './supabase-client';

export type UserDeviceRow = Tables<'user_devices'>;

export async function getDeviceByDeviceId(
  deviceId: string,
): Promise<UserDeviceRow | null> {
  const { data, error } = await supabase.rpc('get_device', {
    p_device_id: deviceId,
  });

  if (error) throw new Error(error.message);
  return (data as UserDeviceRow[] | null)?.[0] ?? null;
}

export async function createDeviceRecord(
  deviceId: string,
): Promise<UserDeviceRow> {
  const { data, error } = await supabase.rpc('create_device', {
    p_device_id: deviceId,
  });

  if (error) throw new Error(error.message);
  const rows = data as UserDeviceRow[] | null;
  if (!rows?.length) throw new Error('create_device returned no rows');
  return rows[0];
}

export async function updateDeviceUnit(
  deviceId: string,
  unit: string,
): Promise<void> {
  const { error } = await supabase.rpc('update_device_unit', {
    p_device_id: deviceId,
    p_unit: unit,
  });

  if (error) throw new Error(error.message);
}

export async function updateDeviceCurrency(
  deviceId: string,
  currencyCode: string,
): Promise<void> {
  const { error } = await supabase.rpc('update_device_currency', {
    p_device_id: deviceId,
    p_currency_code: currencyCode,
  });

  if (error) throw new Error(error.message);
}

/**
 * Updates the subscription_status on the device record.
 * STUB: In production this would be set by a server-side webhook
 * from the billing provider. Exposed here for testing the
 * entitlement flow end-to-end.
 */
export async function updateDeviceSubscription(
  deviceId: string,
  status: string,
): Promise<void> {
  const { error } = await supabase.rpc('update_device_subscription', {
    p_device_id: deviceId,
    p_status: status,
  });

  if (error) throw new Error(error.message);
}
