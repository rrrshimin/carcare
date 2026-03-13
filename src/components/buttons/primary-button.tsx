import { StyleSheet, Pressable, Text } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

// ── Primary CTA button ───────────────────────────────────────────────
// Reused on: Add Vehicle, Onboarding, Add Log, Update Mileage, Share Link, Error Boundary.
// Height: min-h-11 (44px). Radius: rounded-xl (12px). Fill: brand blue #0051E8.
// Disabled state dims to 60% opacity. Press state briefly drops to 90%.
export function PrimaryButton({ label, onPress, disabled, className }: PrimaryButtonProps) {
  return (
    <Pressable
      // min-h-11 = 44px tap target. rounded-xl = 12px corners. bg-[#0051E8] = brand blue fill.
      className={`min-h-11 items-center justify-center rounded-xl bg-[#0051E8] px-4 py-3 ${disabled ? 'opacity-60' : 'opacity-100'} ${className ?? ''}`}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, { opacity: pressed && !disabled ? 0.9 : undefined }]}
    >
      {/* Button label: white, bold, 16px (text-base). Change font-bold to font-extrabold for heavier weight. */}
      <Text className="text-base font-bold text-white">{label}</Text>
    </Pressable>
  );
}

// Blue glow shadow beneath the button. Adjust shadowOpacity / shadowRadius for stronger/softer glow.
const styles = StyleSheet.create({
  button: {
    shadowColor: '#0051E8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
});
