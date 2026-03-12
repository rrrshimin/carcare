import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKeys = {
  onboardingCompleted: 'carcare.onboarding_completed',
  vehicle: 'carcare.vehicle',
  deviceId: 'carcare.device_id',
} as const;

export async function getOnboardingCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(storageKeys.onboardingCompleted);
  return value === 'true';
}

export async function setOnboardingCompleted(value: boolean): Promise<void> {
  await AsyncStorage.setItem(storageKeys.onboardingCompleted, String(value));
}

export async function getDeviceId(): Promise<string | null> {
  return AsyncStorage.getItem(storageKeys.deviceId);
}

export async function setDeviceId(deviceId: string): Promise<void> {
  await AsyncStorage.setItem(storageKeys.deviceId, deviceId);
}

export async function getStoredJson<T>(key: string): Promise<T | null> {
  const rawValue = await AsyncStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as T;
}

export async function setStoredJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const appStorageKeys = storageKeys;
