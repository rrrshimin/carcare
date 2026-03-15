import { Text, View } from 'react-native';

import { ContentCard } from '@/components/cards/content-card';
import { CalendarIcon, TagIcon } from '@/components/icons/row-icons';
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

export function HistoryLogRow({
  specification,
  mileage,
  date,
  notes,
  unit,
}: HistoryLogRowProps) {
  return (
    <ContentCard>
      {mileage != null ? (
        <Text className="text-lg font-bold text-white">
          {formatMileage(mileage, unit)}
        </Text>
      ) : null}

      {date ? (
        <View className="mt-2 flex-row items-center gap-1.5">
          <CalendarIcon size={14} color="#A3ACBF" />
          <Text className="text-sm text-[#A3ACBF]">{formatDate(date)}</Text>
        </View>
      ) : null}

      {specification ? (
        <View className="mt-1.5 flex-row items-center gap-1.5">
          <TagIcon size={14} color="#A3ACBF" />
          <Text className="text-sm text-[#A3ACBF]">{specification}</Text>
        </View>
      ) : null}

      {notes ? (
        <View className="mt-3 border-t border-[#1F2740] pt-3">
          <Text className="text-xs text-[#6B7490]">Notes:</Text>
          <Text className="mt-0.5 text-sm text-[#A3ACBF]">{notes}</Text>
        </View>
      ) : null}
    </ContentCard>
  );
}
