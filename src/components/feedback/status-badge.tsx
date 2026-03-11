import { Text, View } from 'react-native';

type StatusTone = 'neutral' | 'warning';

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const className =
    tone === 'warning'
      ? 'rounded-md border border-[#FFB020]/30 bg-[#FFB020]/10 px-2 py-1 text-xs font-semibold text-[#FFB020]'
      : 'rounded-md border border-[#1F2740] bg-[#0C111F] px-2 py-1 text-xs text-[#A3ACBF]';
  return (
    <View className="self-start">
      <Text className={className}>{label}</Text>
    </View>
  );
}
