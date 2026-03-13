import { DarkTheme, NavigationContainer } from '@react-navigation/native';

import { RootNavigator } from '@/navigation/root-navigator';
import { theme } from '@/constants/theme';

// ── Navigation container with dark theme ─────────────────────────────
// Maps theme.ts colors into React Navigation's theme system.
// This controls default header background, text colors, and tab bar styling.
// "card" = header/tab-bar fill. "notification" = badge color.
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
