import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
    <Stack.Navigator initialRouteName={routes.home}>
      <Stack.Screen name={routes.home} component={HomeScreen} />
      <Stack.Screen name={routes.selectLogType} component={SelectLogTypeScreen} />
      <Stack.Screen name={routes.addLog} component={AddLogScreen} />
      <Stack.Screen name={routes.maintenanceHistory} component={MaintenanceHistoryScreen} />
      <Stack.Screen name={routes.updateMileage} component={UpdateMileageScreen} />
      <Stack.Screen name={routes.shareLink} component={ShareLinkScreen} />
    </Stack.Navigator>
  );
}
