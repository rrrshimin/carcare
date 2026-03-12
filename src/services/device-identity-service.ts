import * as Crypto from 'expo-crypto';

import {
  createDeviceRecord,
  getDeviceByDeviceId,
} from '@/services/api/device-api';
import { getDeviceId, setDeviceId } from '@/services/storage-service';

/**
 * Ensures a persistent device identity exists both locally and in the backend.
 *
 * On first launch a UUID is generated and stored in AsyncStorage, then a
 * matching `user_devices` row is created in Supabase.  On subsequent launches
 * the stored UUID is reused and the backend record is verified.
 */
export async function ensureDeviceIdentity(): Promise<string> {
  let deviceId = await getDeviceId();

  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    await setDeviceId(deviceId);
  }

  await ensureBackendRecord(deviceId);

  return deviceId;
}

async function ensureBackendRecord(deviceId: string): Promise<void> {
  const existing = await getDeviceByDeviceId(deviceId);
  if (existing) return;

  await createDeviceRecord(deviceId);
}
