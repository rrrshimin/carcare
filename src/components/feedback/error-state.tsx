import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons/primary-button';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#0C111F] px-6">
      <Text className="text-lg font-semibold text-white">{title}</Text>
      {message ? (
        <Text className="mt-2 text-center text-sm text-[#A3ACBF]">{message}</Text>
      ) : null}
      {onRetry ? (
        <View className="mt-4 w-full">
          <PrimaryButton label="Try Again" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
