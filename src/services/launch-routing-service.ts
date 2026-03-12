import { routes } from '@/navigation/routes';

export type LaunchRoute =
  | typeof routes.onboarding
  | typeof routes.addVehicle
  | typeof routes.appFlow;

export function resolveLaunchRoute(state: {
  onboardingCompleted: boolean;
  vehicleExists: boolean;
}): LaunchRoute {
  if (!state.onboardingCompleted) return routes.onboarding;
  if (!state.vehicleExists) return routes.addVehicle;
  return routes.appFlow;
}
