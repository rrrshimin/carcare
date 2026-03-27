import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { theme } from '@/constants/theme';
import { routes } from '@/navigation/routes';
import { SplashScreen } from '@/screens/splash/splash-screen';
import { OnboardingScreen } from '@/screens/onboarding/onboarding-screen';
import { AddVehicleScreen } from '@/screens/add-vehicle/add-vehicle-screen';
import { AuthScreen } from '@/screens/auth/auth-screen';
import { OtpVerificationScreen } from '@/screens/auth/otp-verification-screen';
import { UsernameScreen } from '@/screens/auth/username-screen';
import { BusinessDetailsScreen } from '@/screens/business-details/business-details-screen';
import { SetupFlowStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<SetupFlowStackParamList>();

export function SetupFlowNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={routes.splash}
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name={routes.splash} component={SplashScreen} />
      <Stack.Screen name={routes.onboarding} component={OnboardingScreen} />
      <Stack.Screen name={routes.addVehicle} component={AddVehicleScreen} />
      <Stack.Screen name={routes.auth} component={AuthScreen} options={{ headerShown: true, title: 'Sign in' }} />
      <Stack.Screen name={routes.otpVerification} component={OtpVerificationScreen} options={{ headerShown: true, title: 'Verify Email' }} />
      <Stack.Screen name={routes.username} component={UsernameScreen} options={{ headerShown: true, title: 'Username', headerBackVisible: false }} />
      <Stack.Screen name={routes.businessDetails} component={BusinessDetailsScreen} options={{ headerShown: true, title: 'Business Details', headerBackVisible: false }} />
    </Stack.Navigator>
  );
}
