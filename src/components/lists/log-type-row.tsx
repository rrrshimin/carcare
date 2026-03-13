import { Pressable, Text } from 'react-native';

type LogTypeRowProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

export function LogTypeRow({ title, subtitle, onPress }: LogTypeRowProps) {
  return (
    <Pressable
      className="rounded-xl bg-[#141A2B] p-4"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : undefined })}
    >
      <Text className="text-base font-semibold text-white">{title}</Text>
      {subtitle ? <Text className="mt-1 text-xs text-[#A3ACBF]">{subtitle}</Text> : null}
    </Pressable>
  );
}
