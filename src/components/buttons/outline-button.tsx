import { Pressable, Text } from 'react-native';

type OutlineButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
};

export function OutlineButton({ label, onPress, disabled, className, textClassName }: OutlineButtonProps) {
  return (
    <Pressable
      className={`min-h-11 justify-center rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-3 ${disabled ? 'opacity-60' : 'opacity-100'} ${className ?? ''}`}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({ opacity: pressed && !disabled ? 0.85 : undefined })}
    >
      <Text className={`text-sm font-semibold text-[#367DFF] ${textClassName ?? ''}`}>{label}</Text>
    </Pressable>
  );
}
