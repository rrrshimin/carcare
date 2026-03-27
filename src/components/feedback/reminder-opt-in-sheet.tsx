import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BellIcon } from '@/components/icons/app-icons';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { BottomSheet } from '@/components/feedback/bottom-sheet';

type Props = {
  visible: boolean;
  onEnable: () => Promise<void>;
  onSkip: () => void;
};

/**
 * Post-vehicle-creation opt-in sheet for notification reminders.
 *
 * Shown once after the user's first car is saved. Explains value,
 * then triggers `requestNotificationPermission` only when the
 * user taps the CTA — never automatically.
 */
export function ReminderOptInSheet({ visible, onEnable, onSkip }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleEnable() {
    setBusy(true);
    try {
      await onEnable();
    } finally {
      setBusy(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onSkip}>
      <View className="items-center pb-2 pt-2">
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#1A2240]">
          <BellIcon size={28} color="#367DFF" />
        </View>

        <Text
          className="text-center text-lg text-white"
          style={{ fontFamily: 'Poppins-Bold' }}
        >
          Stay on top of maintenance
        </Text>

        <Text
          className="mt-2 text-center text-sm text-[#A3ACBF]"
          style={{ fontFamily: 'Poppins' }}
        >
          CarCare can remind you when it's time to update your mileage or when
          a service is coming up — even when the app is closed.
        </Text>
      </View>

      <View className="mt-4">
        <PrimaryButton
          label={busy ? 'Enabling...' : 'Enable Reminders'}
          onPress={handleEnable}
          disabled={busy}
        />
      </View>

      <Pressable
        onPress={onSkip}
        className="mt-3 items-center py-3"
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Text
          className="text-sm text-[#6B7490]"
          style={{ fontFamily: 'Poppins' }}
        >
          Not now
        </Text>
      </Pressable>
    </BottomSheet>
  );
}
