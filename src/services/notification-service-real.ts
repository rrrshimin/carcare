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
 *   getAllScheduledNotificationsAsync, addNotificationResponseReceivedListener.
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
    shouldShowBanner: true,
    shouldShowList: true,
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

    if (__DEV__) {
      console.info(`[Notifications] current permission status: "${existing}"`);
    }

    if (existing === 'granted') return true;

    // Always try requestPermissionsAsync regardless of current status.
    // On Android 13+, if the user denied via the OS dialog, this call
    // returns 'denied' instantly (no dialog shown) — which is fine.
    // But if the status is stale from a prior install or is 'undetermined',
    // this triggers the actual OS dialog.
    if (__DEV__) {
      console.info('[Notifications] requesting permission from OS…');
    }

    const { status } = await Notifications.requestPermissionsAsync();

    if (__DEV__) {
      console.info(`[Notifications] OS permission result: "${status}"`);
    }

    return status === 'granted';
  } catch (error) {
    if (__DEV__) {
      console.warn('[Notifications] permission request threw:', error);
    }
    return false;
  }
}

/**
 * Returns true when notification permission is already granted.
 * Never shows the OS prompt — safe to call from background scheduling.
 */
export async function hasNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

// ── Scheduling ──────────────────────────────────────────────────────

/**
 * Schedules a local notification at the given date with optional data payload.
 *
 * CHECK-ONLY: verifies permission is already granted. Never shows the
 * OS permission dialog. The caller is responsible for requesting
 * permission at an appropriate user-action point before scheduling.
 *
 * Cancel-then-schedule contract:
 *   The old notification with the same identifier is ALWAYS cancelled
 *   first, even when the new trigger date is in the past.
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
  data?: Record<string, unknown>,
): Promise<boolean> {
  try {
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

    const granted = await hasNotificationPermission();
    if (!granted) {
      if (__DEV__) {
        console.info(
          `[Notifications] skip "${identifier}" — permission not granted`,
        );
      }
      return false;
    }

    await ensureAndroidChannel();

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        data: data ?? {},
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

// ── Notification response listener ──────────────────────────────────

/**
 * Registers a listener that fires when the user taps a notification.
 * Returns a cleanup function to remove the listener.
 */
export function addNotificationResponseListener(
  callback: (data: Record<string, unknown>) => void,
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      if (data && typeof data === 'object') {
        callback(data as Record<string, unknown>);
      }
    },
  );
  return () => subscription.remove();
}

/**
 * Returns the notification response that launched the app (cold start).
 */
export async function getLastNotificationResponse(): Promise<Record<string, unknown> | null> {
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response?.notification?.request?.content?.data) {
      return response.notification.request.content.data as Record<string, unknown>;
    }
  } catch { /* ignore */ }
  return null;
}

// ── Permission status (debug) ────────────────────────────────────────

export async function getPermissionStatus(): Promise<string> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return 'error';
  }
}

// ── QA / Debug helpers ──────────────────────────────────────────────

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
