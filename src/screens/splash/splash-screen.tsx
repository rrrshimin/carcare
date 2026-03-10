import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/constants/theme';
import { routes } from '@/navigation/routes';
import { getOnboardingCompleted } from '@/services/storage-service';
import { getCurrentVehicle } from '@/services/vehicle-service';
import { RootStackParamList, SetupFlowStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<SetupFlowStackParamList, typeof routes.splash>;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    let isMounted = true;

    async function resolveLaunchRoute() {
      try {
        const [onboardingCompleted, vehicle] = await Promise.all([
          getOnboardingCompleted(),
          getCurrentVehicle(),
        ]);

        if (!isMounted) {
          return;
        }

        if (!onboardingCompleted) {
          navigation.replace(routes.onboarding);
          return;
        }

        if (!vehicle) {
          navigation.replace(routes.addVehicle);
          return;
        }

        const rootNavigation = navigation.getParent<
          import('@react-navigation/native').NavigationProp<RootStackParamList>
        >();
        rootNavigation?.navigate(routes.appFlow);
      } catch {
        navigation.replace(routes.onboarding);
      }
    }

    resolveLaunchRoute();

    return () => {
      isMounted = false;
    };
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-[#0C111F] px-6">
      <Text className="text-3xl font-extrabold text-white">CarCare Diary</Text>
      <Text className="mt-2 text-sm text-[#A3ACBF]">Preparing your garage...</Text>
      <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.lg }} />
    </View>
  );
}
