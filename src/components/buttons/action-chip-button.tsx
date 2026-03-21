import { Pressable, Text } from 'react-native';

type ActionChipButtonProps = {
  label: string;
  onPress?: () => void;
  className?: string;
};

// ── Small chip button ────────────────────────────────────────────────
// Used as the "New Log" chip inside MaintenanceCategoryCard.
// Height: min-h-9 (36px). Fill: background dark #0C111F. Border: #1F2740.
// Text: link blue #367DFF, 12px. self-start keeps it compact (no stretch).
export function ActionChipButton({ label, onPress, className }: ActionChipButtonProps) {
  return (
    <Pressable
      className={`min-h-10 self-start justify-center rounded-lg border border-[#1F2740] bg-[#0C111F] px-3 py-2 ${className ?? ''}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : undefined })}
    >
      <Text className="text-[13px] font-semibold text-[#367DFF]">{label}</Text>
    </Pressable>
  );
}
