/**
 * Notification service facade — environment-aware adapter.
 *
 * On Android in Expo Go (SDK 53+), merely importing expo-notifications
 * crashes the app because the package internally calls
 * addPushTokenListener() at module load time, which throws.
 *
 * This facade prevents the crash by NEVER importing the real notification
 * implementation in Expo Go. Instead it returns safe no-ops so the rest
 * of the app runs normally with notifications silently disabled.
 *
 * In development builds and production builds the real implementation
 * (notification-service-real.ts) is loaded lazily on first use via
 * dynamic import().
 *
 * All app code should import from THIS file (@/services/notification-service).
 * Never import notification-service-real.ts directly.
 *
 * To QA notifications, use a development build:
 *   npx expo run:android   or   npx expo run:ios
 */
import { isRunningInExpoGo } from 'expo';

import * as noop from './notification-service-noop';

const _isExpoGo = isRunningInExpoGo();

if (_isExpoGo && __DEV__) {
  console.info(
    '[Notifications] Expo Go detected — notifications disabled at runtime. ' +
      'Use a development build (npx expo run:android) to test notifications.',
  );
}

type RealModule = typeof import('./notification-service-real');

let _real: RealModule | null = null;

async function getReal(): Promise<RealModule | null> {
  if (_isExpoGo) return null;
  if (!_real) {
    _real = await import('./notification-service-real');
  }
  return _real;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const impl = await getReal();
  return impl ? impl.requestNotificationPermission() : noop.requestNotificationPermission();
}

export async function scheduleLocalNotification(
  identifier: string,
  title: string,
  body: string,
  triggerDate: Date,
): Promise<boolean> {
  const impl = await getReal();
  return impl
    ? impl.scheduleLocalNotification(identifier, title, body, triggerDate)
    : noop.scheduleLocalNotification(identifier, title, body, triggerDate);
}

export async function cancelScheduledNotification(
  identifier: string,
): Promise<void> {
  const impl = await getReal();
  return impl
    ? impl.cancelScheduledNotification(identifier)
    : noop.cancelScheduledNotification(identifier);
}

export async function getScheduledNotificationsSummary(): Promise<
  { id: string; title: string; body: string }[]
> {
  const impl = await getReal();
  return impl
    ? impl.getScheduledNotificationsSummary()
    : noop.getScheduledNotificationsSummary();
}

export async function logScheduledNotifications(): Promise<void> {
  const impl = await getReal();
  return impl
    ? impl.logScheduledNotifications()
    : noop.logScheduledNotifications();
}
