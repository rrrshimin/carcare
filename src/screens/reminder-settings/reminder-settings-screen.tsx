import { useCallback, useState } from 'react';
import { Linking, Platform, Pressable, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChevronRightIcon } from '@/components/icons/app-icons';
import { BottomSheet, BottomSheetOption } from '@/components/feedback/bottom-sheet';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { routes } from '@/navigation/routes';
import {
  requestNotificationPermission,
  getPermissionStatus,
} from '@/services/notification-service';
import {
  getReminderSettings,
  saveReminderSettings,
  type MileageReminderInterval,
  type ReminderSettings,
} from '@/services/reminder-settings-service';
import type { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.reminderSettings>;

const MILEAGE_OPTIONS: { label: string; value: MileageReminderInterval }[] = [
  { label: 'Off', value: 'off' },
  { label: '1 week', value: '7' },
  { label: '2 weeks', value: '14' },
  { label: '1 month', value: '30' },
];

function getMileageLabel(value: MileageReminderInterval): string {
  return MILEAGE_OPTIONS.find((o) => o.value === value)?.label ?? 'Off';
}

export function ReminderSettingsScreen(_props: Props) {
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getReminderSettings().then((s) => {
        if (!cancelled) setSettings(s);
      });
      getPermissionStatus().then((status) => {
        if (!cancelled) setPermissionGranted(status === 'granted');
      });
      return () => { cancelled = true; };
    }, []),
  );

  async function handleRequestPermission() {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);

    if (!granted) {
      if (Platform.OS === 'android') {
        Linking.openSettings();
      } else {
        Linking.openURL('app-settings:');
      }
    }
  }

  async function updateMileageInterval(value: MileageReminderInterval) {
    if (!settings) return;
    const updated = { ...settings, mileageReminderInterval: value };
    setSettings(updated);
    setSheetVisible(false);
    await saveReminderSettings(updated);

    if (value !== 'off' && permissionGranted === false) {
      const granted = await requestNotificationPermission();
      setPermissionGranted(granted);
    }
  }

  async function toggleDueSoon(value: boolean) {
    if (!settings) return;
    const updated = { ...settings, dueSoonRemindersEnabled: value };
    setSettings(updated);
    await saveReminderSettings(updated);

    if (value && permissionGranted === false) {
      const granted = await requestNotificationPermission();
      setPermissionGranted(granted);
    }
  }

  if (!settings) return null;

  const hasAnyReminderEnabled =
    settings.mileageReminderInterval !== 'off' || settings.dueSoonRemindersEnabled;

  return (
    <View className="flex-1 bg-[#0C111F]" style={{ padding: 16 }}>
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Mileage Update Reminder"
      >
        {MILEAGE_OPTIONS.map((option) => (
          <BottomSheetOption
            key={option.value}
            label={option.label}
            onPress={() => updateMileageInterval(option.value)}
          />
        ))}
      </BottomSheet>

      {/* Permission warning */}
      {permissionGranted === false && hasAnyReminderEnabled ? (
        <View className="mb-4 rounded-2xl bg-[#2A1A1A] p-4">
          <Text
            className="text-sm text-[#FF9F43]"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Notifications are off
          </Text>
          <Text
            className="mt-1 text-[13px] text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
          >
            Reminders are configured but your device is blocking notifications for this app. Tap below to fix this.
          </Text>
          <View className="mt-3">
            <PrimaryButton
              label="Enable Notifications"
              onPress={handleRequestPermission}
            />
          </View>
        </View>
      ) : null}

      <View className="rounded-2xl bg-[#141A2B]">
        {/* Mileage Update Reminder row */}
        <Pressable
          onPress={() => setSheetVisible(true)}
          className="flex-row items-center px-5 py-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <Text
            className="flex-1 text-sm text-white"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Mileage Update Reminder
          </Text>
          <Text
            className="mr-2 text-sm text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
          >
            {getMileageLabel(settings.mileageReminderInterval)}
          </Text>
          <ChevronRightIcon size={18} color="#A3ACBF" />
        </Pressable>

        {/* Divider */}
        <View className="mx-5 h-px bg-[#1F2740]" />

        {/* Due-Soon Reminders row */}
        <View className="flex-row items-center px-5 py-4">
          <Text
            className="flex-1 text-sm text-white"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Due-Soon Reminders
          </Text>
          <Switch
            value={settings.dueSoonRemindersEnabled}
            onValueChange={toggleDueSoon}
            trackColor={{ false: '#3D4560', true: '#367DFF' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
}
