import { Text, View } from 'react-native';

type ScreenTitleBlockProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

// ── Screen title block ───────────────────────────────────────────────
// Used on headerless screens (Add Vehicle). Title: 30px ExtraBold white.
// Subtitle: 14px secondary gray. Decorative divider: 56px wide, 1px, border color.
// Reusable on any screen that needs a large title with optional description.
export function ScreenTitleBlock({ title, subtitle, className }: ScreenTitleBlockProps) {
  return (
    <View className={`gap-1 ${className ?? ''}`}>
      <Text className="text-3xl font-extrabold text-white">{title}</Text>
      {subtitle ? <Text className="mt-2 text-sm leading-5 text-[#A3ACBF]">{subtitle}</Text> : null}
      
    </View>
  );
}
