import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { routes } from '@/navigation/routes';
import { AppNavigator } from '@/navigation/app-navigator';
import { SetupFlowNavigator } from '@/navigation/setup-flow-navigator';
import { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName={routes.setupFlow} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={routes.setupFlow} component={SetupFlowNavigator} />
      <Stack.Screen name={routes.appFlow} component={AppNavigator} />
    </Stack.Navigator>
  );
}
