import { StyleSheet, Pressable, Text } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

export function PrimaryButton({ label, onPress, disabled, className }: PrimaryButtonProps) {
  return (
    <Pressable
      className={`min-h-11 items-center justify-center rounded-xl bg-[#0051E8] px-4 py-3 ${disabled ? 'opacity-60' : 'opacity-100'} ${className ?? ''}`}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, { opacity: pressed && !disabled ? 0.9 : undefined }]}
    >
      <Text className="text-base font-bold text-white">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    shadowColor: '#0051E8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
});
