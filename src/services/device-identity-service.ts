import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createDeviceRecord } from '@/services/api/device-api';
import { getDeviceId, setDeviceId } from '@/services/storage-service';
import { DEFAULT_CURRENCY_CODE } from '@/services/currency-service';
import { persistCurrencyCode } from '@/hooks/use-currency';

const CURRENCY_STORAGE_KEY = 'carcare.currency_code';

/**
 * Ensures a persistent device identity exists both locally and in the backend.
 *
 * On first launch a UUID is generated and stored in AsyncStorage, then a
 * matching `user_devices` row is created in Supabase.  On subsequent launches
 * the stored UUID is reused.  The create_device RPC is idempotent (ON CONFLICT
 * DO NOTHING) so calling it every time is safe and avoids a separate read call.
 *
 * Also ensures the default currency is persisted if not already set.
 * This covers both first launch AND existing devices that were created
 * before currency support was added.
 */
export async function ensureDeviceIdentity(): Promise<string> {
  let deviceId = await getDeviceId();

  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    await setDeviceId(deviceId);
  }

  await createDeviceRecord(deviceId);

  const cachedCurrency = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
  if (!cachedCurrency) {
    await persistCurrencyCode(DEFAULT_CURRENCY_CODE);
  }

  return deviceId;
}
