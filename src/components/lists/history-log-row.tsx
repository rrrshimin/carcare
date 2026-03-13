import { Text } from 'react-native';

import { ContentCard } from '@/components/cards/content-card';
import { formatDate } from '@/utils/formatting/format-date';
import { formatMileage } from '@/utils/formatting/format-mileage';

type HistoryLogRowProps = {
  specLabel?: string;
  specification: string | null;
  mileage: number | null;
  date: string | null;
  notes: string | null;
  unit?: string;
};

// ── History log entry card ───────────────────────────────────────────
// Shown on MaintenanceHistoryScreen. One card per past log entry.
// Wraps ContentCard (inherits card fill, radius, padding).
// Data lines: 14px white. Notes line: 14px secondary gray.
// mt-1 (4px) between lines. Each field conditionally rendered.
export function HistoryLogRow({
  specLabel = 'Specification',
  specification,
  mileage,
  date,
  notes,
  unit,
}: HistoryLogRowProps) {
  return (
    <ContentCard>
      {specification ? (
        <Text className="text-sm text-white">
          {specLabel}: {specification}
        </Text>
      ) : null}
      {mileage != null ? (
        <Text className="mt-1 text-sm text-white">
          Mileage: {formatMileage(mileage, unit)}
        </Text>
      ) : null}
      {date ? (
        <Text className="mt-1 text-sm text-white">Date: {formatDate(date)}</Text>
      ) : null}
      {notes ? (
        <Text className="mt-1 text-sm text-[#A3ACBF]">Notes: {notes}</Text>
      ) : null}
    </ContentCard>
  );
}
