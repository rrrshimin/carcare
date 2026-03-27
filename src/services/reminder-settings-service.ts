/**
 * Reminder settings — persisted locally in AsyncStorage.
 *
 * LOCAL-ONLY MVP SCOPE:
 *   Settings live on the device. No backend column or sync.
 *   If the user reinstalls the app, defaults are restored.
 *
 * FUTURE:
 *   Store settings in a backend user_preferences table so they
 *   persist across devices and reinstalls.
 *
 * REMINDER TYPES COVERED:
 *   1. Mileage update reminder — configurable interval (off / 7 / 14 / 30 days)
 *   2. Due-soon maintenance reminders — on/off toggle covering both
 *      mileage-based and time-based maintenance items
 */
import { getStoredJson, setStoredJson } from '@/services/storage-service';

const STORAGE_KEY = 'carcare.reminder_settings';

export type MileageReminderInterval = 'off' | '7' | '14' | '30';

export type ReminderSettings = {
  mileageReminderInterval: MileageReminderInterval;
  dueSoonRemindersEnabled: boolean;
};

const DEFAULT_SETTINGS: ReminderSettings = {
  mileageReminderInterval: '30',
  dueSoonRemindersEnabled: true,
};

export function getDefaultReminderSettings(): ReminderSettings {
  return { ...DEFAULT_SETTINGS };
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  const stored = await getStoredJson<ReminderSettings>(STORAGE_KEY);
  if (!stored) return getDefaultReminderSettings();
  return {
    mileageReminderInterval:
      stored.mileageReminderInterval ?? DEFAULT_SETTINGS.mileageReminderInterval,
    dueSoonRemindersEnabled:
      stored.dueSoonRemindersEnabled ?? DEFAULT_SETTINGS.dueSoonRemindersEnabled,
  };
}

export async function saveReminderSettings(
  settings: ReminderSettings,
): Promise<void> {
  await setStoredJson(STORAGE_KEY, settings);
}

/** Returns the interval in days, or null when reminders are disabled. */
export function getMileageReminderDays(
  interval: MileageReminderInterval,
): number | null {
  if (interval === 'off') return null;
  return Number(interval);
}
