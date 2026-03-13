import { Text, View } from 'react-native';

import { MaintenanceStatusVariant } from '@/types/maintenance';

type StatusBadgeProps = {
  label: string;
  variant?: MaintenanceStatusVariant;
};

// ── Status badge color mapping ───────────────────────────────────────
// Controls the visual look of maintenance due-status badges across home & history screens.
// Hex values must be static strings (NativeWind doesn't support dynamic interpolation).
// neutral = no data yet (gray). normal = healthy (white). warning = due soon (amber). overdue = past due (red).
const variantStyles: Record<MaintenanceStatusVariant, string> = {
  neutral: 'rounded-md  py-1 text-xs text-[#A3ACBF]',
  normal: 'rounded-md  text-xs font-semibold text-white',
  warning:
    'rounded-md border border-[#FFB020]/30 bg-[#FFB020]/10 px-2 py-1 text-xs font-semibold text-[#FFB020]',
  overdue:
    'rounded-md border border-[#FF4D4D]/30 bg-[#FF4D4D]/10 px-2 py-1 text-xs font-semibold text-[#FF4D4D]',
};

// ── StatusBadge ──────────────────────────────────────────────────────
// Compact inline badge shown in MaintenanceItemRow and MaintenanceHistoryScreen.
// self-start prevents badge from stretching to full width.
// ⚠ emoji prepended for warning/overdue variants.
export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  const showIcon = variant === 'warning' || variant === 'overdue';
  const displayLabel = showIcon ? `⚠ ${label}` : label;

  return (
    <View className="self-start">
      <Text className={variantStyles[variant]}>{displayLabel}</Text>
    </View>
  );
}
