import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { updateDeviceCurrency } from '@/services/api/device-api';
import { getDeviceId } from '@/services/storage-service';
import { getCurrencySymbol, DEFAULT_CURRENCY_CODE } from '@/services/currency-service';

const CURRENCY_STORAGE_KEY = 'carcare.currency_code';

/**
 * Loads the current device currency code.
 * Priority: AsyncStorage (fast local) → device DB record → fallback USD.
 */
export async function loadCachedCurrencyCode(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
    return stored ?? DEFAULT_CURRENCY_CODE;
  } catch {
    return DEFAULT_CURRENCY_CODE;
  }
}

/**
 * Persists currency code locally and syncs to the device DB record.
 * Both writes are awaited so the caller knows when the DB is updated.
 */
export async function persistCurrencyCode(code: string): Promise<void> {
  await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, code);

  const deviceId = await getDeviceId();
  if (deviceId) {
    try {
      await updateDeviceCurrency(deviceId, code);
    } catch (e) {
      console.warn('[Currency] DB sync failed:', e);
    }
  }
}

type UseCurrencyResult = {
  currencyCode: string;
  currencySymbol: string;
  isLoading: boolean;
  updateCurrency: (code: string) => Promise<void>;
};

/**
 * Hook for reading and updating the device-level currency preference.
 * Works for both guest and authenticated users.
 *
 * Optionally accepts a `dbCurrencyCode` value from a device record that was
 * already loaded by the calling screen (e.g. add-log-screen loads the device
 * for the unit setting). When provided, it seeds the initial state without
 * an extra AsyncStorage read.
 */
export function useCurrency(dbCurrencyCode?: string | null): UseCurrencyResult {
  const [currencyCode, setCurrencyCode] = useState<string>(
    dbCurrencyCode ?? DEFAULT_CURRENCY_CODE,
  );
  const [isLoading, setIsLoading] = useState(!dbCurrencyCode);

  useEffect(() => {
    if (dbCurrencyCode) {
      setCurrencyCode(dbCurrencyCode);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    loadCachedCurrencyCode().then((code) => {
      if (!cancelled) {
        setCurrencyCode(code);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [dbCurrencyCode]);

  const updateCurrency = useCallback(async (code: string) => {
    setCurrencyCode(code);
    await persistCurrencyCode(code);
  }, []);

  return {
    currencyCode,
    currencySymbol: getCurrencySymbol(currencyCode),
    isLoading,
    updateCurrency,
  };
}
