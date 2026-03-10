import { routes } from '@/navigation/routes';

export type SetupFlowStackParamList = {
  [routes.splash]: undefined;
  [routes.onboarding]: undefined;
  [routes.addVehicle]: undefined;
};

export type AppStackParamList = {
  [routes.home]: undefined;
  [routes.selectLogType]: undefined;
  [routes.addLog]: undefined;
  [routes.maintenanceHistory]: undefined;
  [routes.updateMileage]: undefined;
  [routes.shareLink]: undefined;
};

export type RootStackParamList = {
  [routes.setupFlow]: undefined;
  [routes.appFlow]: undefined;
};
