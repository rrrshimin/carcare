import { Text, View } from 'react-native';

type ScreenPlaceholderProps = {
  title: string;
};

export function ScreenPlaceholder({ title }: ScreenPlaceholderProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#0C111F] p-4">
      <Text className="text-2xl font-extrabold text-white">{title}</Text>
      <Text className="mt-2 text-center text-sm text-[#A3ACBF]">
        Phase 1 placeholder screen.
      </Text>
    </View>
  );
}
