import * as Crypto from 'expo-crypto';

import { createDeviceRecord } from '@/services/api/device-api';
import { getDeviceId, setDeviceId } from '@/services/storage-service';

/**
 * Ensures a persistent device identity exists both locally and in the backend.
 *
 * On first launch a UUID is generated and stored in AsyncStorage, then a
 * matching `user_devices` row is created in Supabase.  On subsequent launches
 * the stored UUID is reused.  The create_device RPC is idempotent (ON CONFLICT
 * DO NOTHING) so calling it every time is safe and avoids a separate read call.
 */
export async function ensureDeviceIdentity(): Promise<string> {
  let deviceId = await getDeviceId();

  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    await setDeviceId(deviceId);
  }

  await createDeviceRecord(deviceId);

  return deviceId;
}
