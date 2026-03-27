/**
 * No-op notification implementation for Expo Go.
 *
 * On Android in Expo Go (SDK 53+), importing expo-notifications crashes
 * the app at module load time (the package internally calls
 * addPushTokenListener → warnOfExpoGoPushUsage → throws).
 *
 * This module provides the same public API as notification-service-real.ts
 * but every function is a safe no-op. The facade (notification-service.ts)
 * selects this implementation when running inside Expo Go.
 *
 * To QA notifications, use a development build:
 *   npx expo run:android   or   npx expo run:ios
 */

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function hasNotificationPermission(): Promise<boolean> {
  return false;
}

export async function scheduleLocalNotification(
  _identifier: string,
  _title: string,
  _body: string,
  _triggerDate: Date,
  _data?: Record<string, unknown>,
): Promise<boolean> {
  return false;
}

export async function cancelScheduledNotification(
  _identifier: string,
): Promise<void> {}

export function addNotificationResponseListener(
  _callback: (data: Record<string, unknown>) => void,
): () => void {
  return () => {};
}

export async function getLastNotificationResponse(): Promise<Record<string, unknown> | null> {
  return null;
}

export async function getPermissionStatus(): Promise<string> {
  return 'noop';
}

export async function getScheduledNotificationsSummary(): Promise<
  { id: string; title: string; body: string }[]
> {
  return [];
}

export async function logScheduledNotifications(): Promise<void> {}
