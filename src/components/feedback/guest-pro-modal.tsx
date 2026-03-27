import { Modal, Pressable, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { SubscriptionStarIcon } from '@/components/icons/app-icons';

type Props = {
  visible: boolean;
  onCreateAccount: () => void;
  onDismiss: () => void;
};

export function GuestProModal({ visible, onCreateAccount, onDismiss }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-sm rounded-2xl bg-[#141A2B] p-6">
          <View className="items-center">
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#1A2240]">
              <SubscriptionStarIcon size={28} />
            </View>

            <Text
              className="text-xl text-white"
              style={{ fontFamily: 'Poppins-Bold' }}
            >
              You're on Pro!
            </Text>
          </View>

          <Text
            className="mt-3 text-center text-sm leading-5 text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
          >
            You can start using Pro features right away.{'\n\n'}
            To get the most out of your plan — like invoices with your company
            details — we recommend creating an account.{'\n\n'}
            You can do this anytime from the Account screen.
          </Text>

          <View className="mt-5">
            <PrimaryButton label="Create Account" onPress={onCreateAccount} />
          </View>

          <Pressable className="mt-4 items-center py-2" onPress={onDismiss}>
            <Text
              className="text-sm text-[#A3ACBF]"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Continue without account
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
