/**
 * Real notification implementation — uses expo-notifications.
 *
 * WARNING: This file must NEVER be imported at the top level. On Android in
 * Expo Go (SDK 53+), merely importing expo-notifications crashes the app
 * because the package internally calls addPushTokenListener() at load time.
 *
 * This module is loaded via dynamic import() from notification-service.ts
 * (the facade) ONLY when the app is running in a development or production
 * build — never in Expo Go.
 *
 * Local-notification-only APIs used:
 *   setNotificationHandler, setNotificationChannelAsync,
 *   getPermissionsAsync, requestPermissionsAsync,
 *   scheduleNotificationAsync, cancelScheduledNotificationAsync,
 *   getAllScheduledNotificationsAsync.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  ANDROID_CHANNEL_ID,
  ANDROID_CHANNEL_NAME,
} from '@/constants/notification-config';

// ── Foreground handler ──────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ── Android channel (lazy, created once) ────────────────────────────

let channelReady = false;

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android' || channelReady) return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: ANDROID_CHANNEL_NAME,
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: undefined,
  });
  channelReady = true;
}

// ── Permission handling ─────────────────────────────────────────────

/**
 * Returns true when notification permission is granted.
 * Only shows the system prompt when permission has never been requested
 * (status === "undetermined").  After explicit denial the function
 * returns false immediately — it never re-prompts a user who already
 * said no, which prevents the permission-spam loop on Android.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    if (existing === 'denied') {
      if (__DEV__) {
        console.warn(
          '[Notifications] permission denied by user — scheduling disabled. ' +
            'Enable in device Settings > Notifications to re-enable reminders.',
        );
      }
      return false;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

// ── Scheduling ──────────────────────────────────────────────────────

/**
 * Schedules a local notification at the given date.
 *
 * Cancel-then-schedule contract:
 *   The old notification with the same identifier is ALWAYS cancelled
 *   first, even when the new trigger date is in the past.  This
 *   prevents stale notifications from surviving when a replacement
 *   date happens to be earlier than "now".
 *
 * Returns true when a new notification was successfully scheduled.
 * Returns false (without throwing) when:
 *   - triggerDate is in the past (old notification still cancelled)
 *   - triggerDate is NaN / Invalid Date
 *   - permission is not granted
 *   - the underlying OS call fails
 */
export async function scheduleLocalNotification(
  identifier: string,
  title: string,
  body: string,
  triggerDate: Date,
): Promise<boolean> {
  try {
    // Always cancel the previous notification with this ID so stale
    // reminders are cleaned up even when the replacement date is past.
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(
      () => {},
    );

    if (isNaN(triggerDate.getTime())) {
      if (__DEV__) {
        console.warn(
          `[Notifications] skip "${identifier}" — invalid trigger date`,
        );
      }
      return false;
    }

    if (triggerDate.getTime() <= Date.now()) {
      if (__DEV__) {
        console.info(
          `[Notifications] skip "${identifier}" — trigger date in the past (${triggerDate.toISOString()})`,
        );
      }
      return false;
    }

    const granted = await requestNotificationPermission();
    if (!granted) return false;

    await ensureAndroidChannel();

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    if (__DEV__) {
      console.info(
        `[Notifications] scheduled "${identifier}" → ${triggerDate.toISOString()}`,
      );
    }

    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn(
        `[Notifications] failed to schedule "${identifier}":`,
        error,
      );
    }
    return false;
  }
}

export async function cancelScheduledNotification(
  identifier: string,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    if (__DEV__) {
      console.info(`[Notifications] cancelled "${identifier}"`);
    }
  } catch {
    // Notification may not exist; safe to ignore.
  }
}

// ── QA / Debug helpers ──────────────────────────────────────────────

/**
 * Returns a summary of every notification currently sitting in the OS
 * schedule queue.  Useful for manual QA to confirm that the right
 * reminders are pending after creating a vehicle, updating mileage,
 * or saving a maintenance log.
 */
export async function getScheduledNotificationsSummary(): Promise<
  { id: string; title: string; body: string }[]
> {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    return all.map((n) => ({
      id: n.identifier,
      title: typeof n.content.title === 'string' ? n.content.title : '',
      body: typeof n.content.body === 'string' ? n.content.body : '',
    }));
  } catch {
    return [];
  }
}

/**
 * Dumps all scheduled notifications to the JS console.
 *
 * No-op in production builds.  During development / QA, call from:
 *   • React Native debugger console
 *   • a debug screen button
 *   • an in-app dev menu action
 */
export async function logScheduledNotifications(): Promise<void> {
  if (!__DEV__) return;

  const summary = await getScheduledNotificationsSummary();
  if (summary.length === 0) {
    console.info('[Notifications] no scheduled notifications');
    return;
  }
  console.info(
    `[Notifications] ${summary.length} scheduled notification(s):`,
  );
  for (const n of summary) {
    console.info(`  → ${n.id}: "${n.title}" / "${n.body}"`);
  }
}
