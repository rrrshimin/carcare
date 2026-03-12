import { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/constants/theme';
import { useAppBootstrap } from '@/hooks/use-app-bootstrap';
import { routes } from '@/navigation/routes';
import { resolveLaunchRoute } from '@/services/launch-routing-service';
import { SetupFlowStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<SetupFlowStackParamList, typeof routes.splash>;

export function SplashScreen({ navigation }: Props) {
  const { isReady, onboardingCompleted, vehicleExists, error } =
    useAppBootstrap();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isReady || hasNavigated.current) return;

    if (error) {
      navigation.replace(routes.onboarding);
      hasNavigated.current = true;
      return;
    }

    const target = resolveLaunchRoute({ onboardingCompleted, vehicleExists });

    if (target === routes.appFlow) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routes.appFlow }],
        }),
      );
    } else {
      navigation.replace(target);
    }

    hasNavigated.current = true;
  }, [isReady, onboardingCompleted, vehicleExists, error, navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-[#0C111F] px-6">
      <Text className="text-3xl font-extrabold text-white">CarCare Diary</Text>
      <Text className="mt-2 text-sm text-[#A3ACBF]">
        {error ? 'Something went wrong. Restarting...' : 'Preparing your garage...'}
      </Text>
      <ActivityIndicator
        color={theme.colors.primary}
        style={{ marginTop: theme.spacing.lg }}
      />
    </View>
  );
}
