import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { routes } from '@/navigation/routes';
import { SplashScreen } from '@/screens/splash/splash-screen';
import { OnboardingScreen } from '@/screens/onboarding/onboarding-screen';
import { AddVehicleScreen } from '@/screens/add-vehicle/add-vehicle-screen';
import { SetupFlowStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<SetupFlowStackParamList>();

// Temporary setup flow stack before launch gating logic is implemented in later phases.
export function SetupFlowNavigator() {
  return (
    <Stack.Navigator initialRouteName={routes.splash}>
      <Stack.Screen name={routes.splash} component={SplashScreen} />
      <Stack.Screen name={routes.onboarding} component={OnboardingScreen} />
      <Stack.Screen name={routes.addVehicle} component={AddVehicleScreen} />
    </Stack.Navigator>
  );
}
