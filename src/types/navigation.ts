import { routes } from '@/navigation/routes';

export type SetupFlowStackParamList = {
  [routes.splash]: undefined;
  [routes.onboarding]: undefined;
  [routes.addVehicle]: undefined;
  [routes.auth]: undefined;
  [routes.username]: undefined;
};

export type AppStackParamList = {
  [routes.vehicle]: undefined;
  [routes.garage]: undefined;
  [routes.selectLogType]: {
    categoryId: number;
    categoryName: string;
  };
  [routes.addLog]: {
    logTypeId: number;
    logTypeName: string;
  };
  [routes.maintenanceHistory]: {
    logTypeId: number;
    logTypeName: string;
  };
  [routes.updateMileage]: undefined;
  [routes.editVehicle]: { vehicleId: number };
  [routes.shareLink]: undefined;
  [routes.paywall]: undefined;
  [routes.account]: undefined;
  [routes.auth]: undefined;
  [routes.username]: undefined;
  [routes.transfer]: { vehicleId: number };
};

export type RootStackParamList = {
  [routes.setupFlow]: undefined;
  [routes.appFlow]: undefined;
};
