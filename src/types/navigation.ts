import { routes } from '@/navigation/routes';

export type SetupFlowStackParamList = {
  [routes.splash]: undefined;
  [routes.onboarding]: undefined;
  [routes.addVehicle]: { mode?: 'add-another' } | undefined;
  [routes.auth]: undefined;
  [routes.otpVerification]: { email: string };
  [routes.username]: undefined;
  [routes.businessDetails]: undefined;
};

export type AppStackParamList = {
  [routes.vehicle]: undefined;
  [routes.garage]: undefined;
  [routes.selectLogType]: {
    categoryId: number;
    categoryName: string;
    vehicleFuelType: string | null;
    vehicleTransmission: string | null;
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
  [routes.spending]: undefined;
  [routes.paywall]: undefined;
  [routes.account]: undefined;
  [routes.auth]: undefined;
  [routes.otpVerification]: { email: string };
  [routes.username]: undefined;
  [routes.transfer]: { vehicleId: number };
  [routes.reminderSettings]: undefined;
  [routes.garageAnalytics]: undefined;
  [routes.export]: undefined;
  [routes.businessDetails]: undefined;
  [routes.companySettings]: undefined;
};

export type RootStackParamList = {
  [routes.setupFlow]: undefined;
  [routes.appFlow]: undefined;
};
