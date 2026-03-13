import { ActivityIndicator, View } from 'react-native';

import { theme } from '@/constants/theme';

type LoadingStateProps = {
  color?: string;
};

// ── Full-screen loading state ────────────────────────────────────────
// Centered spinner on dark background. Spinner color defaults to brand blue.
// Used on Home, Maintenance History, and any screen while data is loading.
export function LoadingState({ color = theme.colors.primary }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#0C111F]">
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}
