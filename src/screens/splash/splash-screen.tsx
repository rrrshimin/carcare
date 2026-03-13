import { useEffect, useRef } from 'react';
import { Image, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

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

  // ── Splash visual ────────────────────────────────────────────────────
  // Full-screen dark background with centered logo. Logo asset: assets/splash-icon.png.
  // Logo size: h-24 (96px) × w-48 (192px). Change these to resize the splash logo.
  return (
    <View className="flex-1 items-center justify-center bg-[#0C111F]">
      <Image
        source={require('../../../assets/splash-icon.png')}
        resizeMode="contain"
        className="h-24 w-48"
      />
    </View>
  );
}
