import { Pressable, Text } from 'react-native';

type LogTypeRowProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

// ── Log type selection row ───────────────────────────────────────────
// Used on SelectLogTypeScreen. One row per maintenance item in a category.
// Fill: card color #141A2B. Radius: rounded-xl (12px). Padding: p-4 (16px).
// Title: 16px SemiBold white. Subtitle: 12px secondary gray.
export function LogTypeRow({ title, subtitle, onPress }: LogTypeRowProps) {
  return (
    <Pressable
      className="rounded-xl bg-[#141A2B] p-5"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : undefined })}
    >
      <Text className="text-base font-semibold text-white">{title}</Text>
      
    </Pressable>
  );
}
