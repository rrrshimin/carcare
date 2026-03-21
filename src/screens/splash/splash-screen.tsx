import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { useAppBootstrap } from '@/hooks/use-app-bootstrap';
import { routes } from '@/navigation/routes';
import { resolveLaunchRoute } from '@/services/launch-routing-service';
import { SetupFlowStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<SetupFlowStackParamList, typeof routes.splash>;

export function SplashScreen({ navigation }: Props) {
  const [attempt, setAttempt] = useState(0);
  const { isReady, onboardingCompleted, vehicleExists, vehicleCount, error } =
    useAppBootstrap(attempt);
  const hasNavigated = useRef(false);

  const handleRetry = useCallback(() => {
    hasNavigated.current = false;
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isReady || hasNavigated.current || error) return;

    const target = resolveLaunchRoute({ onboardingCompleted, vehicleExists });

    if (target === routes.appFlow) {
      if (vehicleCount >= 2) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: routes.appFlow,
                state: { routes: [{ name: routes.garage }] },
              },
            ],
          }),
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: routes.appFlow,
                state: {
                  routes: [
                    { name: routes.garage },
                    { name: routes.vehicle },
                  ],
                  index: 1,
                },
              },
            ],
          }),
        );
      }
    } else {
      navigation.replace(target);
    }

    hasNavigated.current = true;
  }, [isReady, onboardingCompleted, vehicleExists, vehicleCount, error, navigation]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0A0C14] px-6">
        <Image
          source={require('../../../assets/splash-icon.png')}
          resizeMode="contain"
          className="h-24 w-48"
        />
        <Text className="mt-6 text-center text-sm text-[#A3ACBF]">
          Could not connect. Check your internet and try again.
        </Text>
        <View className="mt-4 w-full">
          <PrimaryButton label="Retry" onPress={handleRetry} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-[#0A0C14]">
      <Image
        source={require('../../../assets/splash-icon.png')}
        resizeMode="contain"
        className="h-24 w-48"
      />
    </View>
  );
}
