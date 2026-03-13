import { Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

// ── Section header ───────────────────────────────────────────────────
// Lightweight heading for content sections within a screen.
// Title: 18px Bold white. Subtitle: 14px secondary gray.
// Currently not used on main screens but available for future sections.
export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View>
      <Text className="text-lg font-bold text-white">{title}</Text>
      {subtitle ? <Text className="mt-1 text-sm text-[#A3ACBF]">{subtitle}</Text> : null}
    </View>
  );
}
