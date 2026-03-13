import { Pressable, Text } from 'react-native';

type OutlineButtonProps = {
  label: string;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
};

// ── Outline / secondary button ───────────────────────────────────────
// Reused on: VehicleHeroCard (Share), ShareLinkScreen (Copy/Share/Stop Sharing).
// Height: min-h-11 (44px). Fill: card dark #141A2B. Border: #1F2740.
// Text: link blue #367DFF. Override textClassName/className for color variants (e.g. warning).
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
