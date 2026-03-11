import { Pressable, Text } from 'react-native';

type ActionChipButtonProps = {
  label: string;
  onPress?: () => void;
  className?: string;
};

export function ActionChipButton({ label, onPress, className }: ActionChipButtonProps) {
  return (
    <Pressable
      className={`min-h-9 self-start justify-center rounded-lg border border-[#1F2740] bg-[#0C111F] px-3 py-2 ${className ?? ''}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : undefined })}
    >
      <Text className="text-xs font-semibold text-[#367DFF]">{label}</Text>
    </Pressable>
  );
}
