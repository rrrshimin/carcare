import { DarkTheme, NavigationContainer } from '@react-navigation/native';

import { RootNavigator } from '@/navigation/root-navigator';
import { theme } from '@/constants/theme';

export function AppNavigationContainer() {
  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          notification: theme.colors.warning,
        },
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
