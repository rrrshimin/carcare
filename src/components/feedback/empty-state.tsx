import { Text, View } from 'react-native';

type EmptyStateProps = {
  title: string;
  message?: string;
};

// ── Full-screen empty state ──────────────────────────────────────────
// Centered placeholder when there's no data (e.g. no maintenance history).
// flex-1 fills entire screen area. Background matches app dark theme.
// Title: 18px SemiBold white. Message: 14px secondary gray.
export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#0C111F] px-6">
      <Text className="text-lg font-semibold text-white">{title}</Text>
      {message ? (
        <Text className="mt-2 text-center text-sm text-[#A3ACBF]">{message}</Text>
      ) : null}
    </View>
  );
}
