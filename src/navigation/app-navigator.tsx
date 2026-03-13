import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { theme } from '@/constants/theme';
import { routes } from '@/navigation/routes';
import { AddLogScreen } from '@/screens/add-log/add-log-screen';
import { HomeScreen } from '@/screens/home/home-screen';
import { MaintenanceHistoryScreen } from '@/screens/maintenance-history/maintenance-history-screen';
import { SelectLogTypeScreen } from '@/screens/select-log-type/select-log-type-screen';
import { ShareLinkScreen } from '@/screens/share-link/share-link-screen';
import { UpdateMileageScreen } from '@/screens/update-mileage/update-mileage-screen';
import { AppStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={routes.home}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name={routes.home} component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name={routes.selectLogType} component={SelectLogTypeScreen} options={{ title: 'Select Log Type' }} />
      <Stack.Screen name={routes.addLog} component={AddLogScreen} options={{ title: 'Add Log' }} />
      <Stack.Screen name={routes.maintenanceHistory} component={MaintenanceHistoryScreen} options={{ title: 'Maintenance History' }} />
      <Stack.Screen name={routes.updateMileage} component={UpdateMileageScreen} options={{ title: 'Update Mileage' }} />
      <Stack.Screen name={routes.shareLink} component={ShareLinkScreen} options={{ title: 'Share' }} />
    </Stack.Navigator>
  );
}
