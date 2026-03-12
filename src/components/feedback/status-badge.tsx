import { Text, View } from 'react-native';

import { MaintenanceStatusVariant } from '@/types/maintenance';

type StatusBadgeProps = {
  label: string;
  variant?: MaintenanceStatusVariant;
};

// Hex values here must stay in sync with theme.colors (NativeWind needs static class names)
const variantStyles: Record<MaintenanceStatusVariant, string> = {
  neutral: 'rounded-md border border-[#1F2740] bg-[#0C111F] px-2 py-1 text-xs text-[#A3ACBF]',
  normal: 'rounded-md border border-[#1F2740] bg-[#0C111F] px-2 py-1 text-xs font-semibold text-white',
  warning:
    'rounded-md border border-[#FFB020]/30 bg-[#FFB020]/10 px-2 py-1 text-xs font-semibold text-[#FFB020]',
  overdue:
    'rounded-md border border-[#FF4D4D]/30 bg-[#FF4D4D]/10 px-2 py-1 text-xs font-semibold text-[#FF4D4D]',
};

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  const showIcon = variant === 'warning' || variant === 'overdue';
  const displayLabel = showIcon ? `⚠ ${label}` : label;

  return (
    <View className="self-start">
      <Text className={variantStyles[variant]}>{displayLabel}</Text>
    </View>
  );
}
