import './global.css';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from './src/components/feedback/error-boundary';
import { AppNavigationContainer } from './src/navigation/app-navigation-container';

// ─── APP ROOT ────────────────────────────────────────────────────────
// Outermost wrapper. Controls font loading, safe areas, gesture support,
// status bar appearance, and global error boundary.
export default function App() {
  // Poppins variants loaded here. If a weight is missing, text falls back to default.
  // Add/remove weights here to change available typography across the app.
  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'Poppins-ExtraBold': Poppins_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    // flex:1 ensures the gesture root fills the screen
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* SafeAreaProvider enables useSafeAreaInsets in child screens */}
      <SafeAreaProvider>
        <ErrorBoundary>
          {/* "light" = white status bar icons on dark background */}
          <StatusBar style="light" />
          <AppNavigationContainer />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
