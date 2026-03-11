import { Pressable, Text } from 'react-native';

type OutlineButtonProps = {
  label: string;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
};

export function OutlineButton({ label, onPress, className, textClassName }: OutlineButtonProps) {
  return (
    <Pressable
      className={`min-h-11 justify-center rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-3 ${className ?? ''}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : undefined })}
    >
      <Text className={`text-sm font-semibold text-[#367DFF] ${textClassName ?? ''}`}>{label}</Text>
    </Pressable>
  );
}
