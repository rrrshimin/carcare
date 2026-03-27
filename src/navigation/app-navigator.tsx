import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { theme } from '@/constants/theme';
import { routes } from '@/navigation/routes';
import { AccountScreen } from '@/screens/account/account-screen';
import { AddLogScreen } from '@/screens/add-log/add-log-screen';
import { AuthScreen } from '@/screens/auth/auth-screen';
import { OtpVerificationScreen } from '@/screens/auth/otp-verification-screen';
import { UsernameScreen } from '@/screens/auth/username-screen';
import { ExportScreen } from '@/screens/export/export-screen';
import { GarageScreen } from '@/screens/garage/garage-screen';
import { GarageAnalyticsScreen } from '@/screens/garage-analytics/garage-analytics-screen';
import { VehicleScreen } from '@/screens/vehicle/vehicle-screen';
import { MaintenanceHistoryScreen } from '@/screens/maintenance-history/maintenance-history-screen';
import { SelectLogTypeScreen } from '@/screens/select-log-type/select-log-type-screen';
import { EditVehicleScreen } from '@/screens/edit-vehicle/edit-vehicle-screen';
import { PaywallScreen } from '@/screens/paywall/paywall-screen';
import { SpendingScreen } from '@/screens/spending/spending-screen';
import { ShareLinkScreen } from '@/screens/share-link/share-link-screen';
import { ReminderSettingsScreen } from '@/screens/reminder-settings/reminder-settings-screen';
import { TransferScreen } from '@/screens/transfer/transfer-screen';
import { UpdateMileageScreen } from '@/screens/update-mileage/update-mileage-screen';
import { BusinessDetailsScreen } from '@/screens/business-details/business-details-screen';
import { CompanySettingsScreen } from '@/screens/company-settings/company-settings-screen';
import { AppStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();

// ── Main app stack (post-setup) ──────────────────────────────────────
// Default header: dark background from theme, white tint, no shadow, no back title.
// Home hides its header (full-bleed hero image). All other screens show the default header.
// Change headerStyle.backgroundColor here to affect all inner screen headers at once.
export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={routes.vehicle}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name={routes.vehicle} component={VehicleScreen} options={{ headerShown: false }} />
      <Stack.Screen name={routes.garage} component={GarageScreen} options={{ headerShown: false }} />
      <Stack.Screen name={routes.selectLogType} component={SelectLogTypeScreen} options={{ title: 'Select Log Type' }} />
      <Stack.Screen name={routes.addLog} component={AddLogScreen} options={{ title: 'Add Log' }} />
      <Stack.Screen name={routes.maintenanceHistory} component={MaintenanceHistoryScreen} options={{ title: 'Maintenance History' }} />
      <Stack.Screen name={routes.updateMileage} component={UpdateMileageScreen} options={{ title: 'Update Mileage' }} />
      <Stack.Screen name={routes.editVehicle} component={EditVehicleScreen} options={{ title: 'Edit Vehicle' }} />
      <Stack.Screen name={routes.shareLink} component={ShareLinkScreen} options={{ title: 'Share' }} />
      <Stack.Screen name={routes.spending} component={SpendingScreen} options={{ headerShown: false }} />
      <Stack.Screen name={routes.garageAnalytics} component={GarageAnalyticsScreen} options={{ headerShown: false }} />
      <Stack.Screen name={routes.export} component={ExportScreen} options={{ headerShown: false }} />
      <Stack.Screen name={routes.paywall} component={PaywallScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name={routes.transfer} component={TransferScreen} options={{ title: 'Transfer Vehicle' }} />
      <Stack.Screen name={routes.reminderSettings} component={ReminderSettingsScreen} options={{ title: 'Reminders' }} />
      <Stack.Screen name={routes.account} component={AccountScreen} options={{ title: 'Account' }} />
      <Stack.Screen name={routes.auth} component={AuthScreen} options={{ title: 'Sign in' }} />
      <Stack.Screen name={routes.otpVerification} component={OtpVerificationScreen} options={{ title: 'Verify Email' }} />
      <Stack.Screen name={routes.username} component={UsernameScreen} options={{ title: 'Username', headerBackVisible: false }} />
      <Stack.Screen name={routes.businessDetails} component={BusinessDetailsScreen} options={{ title: 'Business Details', headerBackVisible: false }} />
      <Stack.Screen name={routes.companySettings} component={CompanySettingsScreen} options={{ title: 'Company Settings' }} />
    </Stack.Navigator>
  );
}
