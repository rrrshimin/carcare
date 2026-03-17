import { Modal, Pressable, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons/primary-button';

type Props = {
  visible: boolean;
  onSignIn: () => void;
  onCancel: () => void;
};

export function SignInGateModal({ visible, onSignIn, onCancel }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-sm rounded-2xl bg-[#141A2B] p-6">
          <Text
            className="text-xl text-white"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            Create an account
          </Text>

          <Text
            className="mt-3 text-sm leading-5 text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
          >
            Sign in or create an account to add more cars, access subscriptions,
            and keep your data safe across devices.
          </Text>

          <View className="mt-5">
            <PrimaryButton label="Sign in / Create account" onPress={onSignIn} />
          </View>

          <Pressable className="mt-4 items-center py-2" onPress={onCancel}>
            <Text
              className="text-sm text-[#A3ACBF]"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
