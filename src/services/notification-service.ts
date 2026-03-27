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

if (__DEV__) {
  console.info(
    _isExpoGo
      ? '[Notifications] Expo Go detected — using NOOP implementation. Use a dev build to test notifications.'
      : '[Notifications] Dev/production build detected — using REAL implementation.',
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

export async function hasNotificationPermission(): Promise<boolean> {
  const impl = await getReal();
  return impl ? impl.hasNotificationPermission() : noop.hasNotificationPermission();
}

export async function scheduleLocalNotification(
  identifier: string,
  title: string,
  body: string,
  triggerDate: Date,
  data?: Record<string, unknown>,
): Promise<boolean> {
  const impl = await getReal();
  return impl
    ? impl.scheduleLocalNotification(identifier, title, body, triggerDate, data)
    : noop.scheduleLocalNotification(identifier, title, body, triggerDate, data);
}

export async function cancelScheduledNotification(
  identifier: string,
): Promise<void> {
  const impl = await getReal();
  return impl
    ? impl.cancelScheduledNotification(identifier)
    : noop.cancelScheduledNotification(identifier);
}

export function addNotificationResponseListener(
  callback: (data: Record<string, unknown>) => void,
): (() => void) | Promise<() => void> {
  if (_isExpoGo) return noop.addNotificationResponseListener(callback);

  // For dev/prod builds we need the real module. Since getReal() is async
  // but listeners must be registered synchronously where possible, we
  // eagerly load the real module and return a cleanup promise.
  return getReal().then((impl) => {
    if (!impl) return noop.addNotificationResponseListener(callback);
    return impl.addNotificationResponseListener(callback);
  });
}

export async function getLastNotificationResponse(): Promise<Record<string, unknown> | null> {
  const impl = await getReal();
  return impl
    ? impl.getLastNotificationResponse()
    : noop.getLastNotificationResponse();
}

export async function getPermissionStatus(): Promise<string> {
  const impl = await getReal();
  return impl ? impl.getPermissionStatus() : noop.getPermissionStatus();
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
