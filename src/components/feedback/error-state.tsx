import { Text, View } from 'react-native';

type ErrorStateProps = {
  title?: string;
  message?: string;
};

// ── Full-screen error state ──────────────────────────────────────────
// Displayed when data fetch fails (Home, Maintenance History, etc.).
// Same layout as EmptyState. Visually identical — differentiated by content only.
export function ErrorState({
  title = 'Something went wrong',
  message,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#0C111F] px-6">
      <Text className="text-lg font-semibold text-white">{title}</Text>
      {message ? (
        <Text className="mt-2 text-center text-sm text-[#A3ACBF]">{message}</Text>
      ) : null}
    </View>
  );
}
