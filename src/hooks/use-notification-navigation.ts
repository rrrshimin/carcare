/**
 * Handles notification tap → screen navigation.
 *
 * LOCAL-ONLY MVP SCOPE:
 *   When the user taps a notification, this hook reads the `data` payload
 *   and navigates to the appropriate screen:
 *     • mileage-reminder   → UpdateMileage screen
 *     • service-due-soon   → Vehicle screen (for the relevant car)
 *
 * Must be rendered inside a NavigationContainer so useNavigation() works.
 *
 * FUTURE:
 *   When backend push notifications are added, this same hook can handle
 *   the routing — just ensure the push payload includes the same `type`
 *   and `vehicleId` shape.
 */
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { routes } from '@/navigation/routes';
import type { NotificationDataType } from '@/constants/notification-config';
import {
  addNotificationResponseListener,
  getLastNotificationResponse,
} from '@/services/notification-service';
import { setActiveVehicleId } from '@/store/vehicle-store';
import type { AppStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<AppStackParamList>;

function handleNotificationData(
  data: Record<string, unknown>,
  navigation: Nav,
): void {
  const type = data.type as NotificationDataType | undefined;
  if (!type) return;

  const vehicleId = typeof data.vehicleId === 'number' ? data.vehicleId : undefined;

  if (vehicleId != null) {
    setActiveVehicleId(vehicleId);
  }

  switch (type) {
    case 'mileage-reminder':
      navigation.navigate(routes.updateMileage);
      break;
    case 'service-due-soon':
      navigation.navigate(routes.vehicle);
      break;
  }
}

export function useNotificationNavigation(): void {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    // Handle notification that launched the app (cold start)
    getLastNotificationResponse().then((data) => {
      if (data) handleNotificationData(data, navigation);
    });

    // Handle notification tap while app is running (warm start)
    const cleanupOrPromise = addNotificationResponseListener((data) => {
      handleNotificationData(data, navigation);
    });

    return () => {
      if (typeof cleanupOrPromise === 'function') {
        cleanupOrPromise();
      } else if (cleanupOrPromise && typeof (cleanupOrPromise as Promise<() => void>).then === 'function') {
        (cleanupOrPromise as Promise<() => void>).then((fn) => fn());
      }
    };
  }, [navigation]);
}
