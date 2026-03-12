import { routes } from '@/navigation/routes';

export type SetupFlowStackParamList = {
  [routes.splash]: undefined;
  [routes.onboarding]: undefined;
  [routes.addVehicle]: undefined;
};

export type AppStackParamList = {
  [routes.home]: undefined;
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
  [routes.shareLink]: undefined;
};

export type RootStackParamList = {
  [routes.setupFlow]: undefined;
  [routes.appFlow]: undefined;
};
