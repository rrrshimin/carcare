import { Pressable, Text, View } from 'react-native';

import { ContentCard } from '@/components/cards/content-card';
import { TrashIcon } from '@/components/icons/app-icons';
import { CalendarIcon, CostIcon, TagIcon } from '@/components/icons/row-icons';
import { formatDate } from '@/utils/formatting/format-date';
import { formatMileage } from '@/utils/formatting/format-mileage';

type HistoryLogRowProps = {
  specLabel?: string;
  specification: string | null;
  mileage: number | null;
  date: string | null;
  notes: string | null;
  costAmount?: number | null;
  currencySymbol?: string;
  unit?: string;
  onDelete?: () => void;
  readOnly?: boolean;
};

function formatCost(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function HistoryLogRow({
  specification,
  mileage,
  date,
  notes,
  costAmount,
  currencySymbol = '$',
  unit,
  onDelete,
  readOnly,
}: HistoryLogRowProps) {
  return (
    <ContentCard>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {mileage != null ? (
            <Text className="text-lg font-bold text-white">
              {formatMileage(mileage, unit)}
            </Text>
          ) : null}
        </View>

        {onDelete && !readOnly ? (
          <Pressable
            onPress={onDelete}
            hitSlop={10}
            className="ml-2 rounded-lg p-1"
          >
            <TrashIcon size={18} />
          </Pressable>
        ) : null}
      </View>

      {readOnly ? (
        <View className="mt-1">
          <Text className="text-[10px] text-[#6B7490]" style={{ fontFamily: 'Poppins' }}>
            Logged by previous owner
          </Text>
        </View>
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

      {costAmount != null && costAmount > 0 ? (
        <View className="mt-1.5 flex-row items-center gap-1.5">
          <CostIcon size={14} color="#A3ACBF" />
          <Text className="text-sm text-[#A3ACBF]">
            {currencySymbol}{formatCost(costAmount)}
          </Text>
        </View>
      ) : null}

      {notes ? (
        <View className="mt-3 border-t border-[#1F2740] pt-3">
          <Text className="text-[13px] text-[#6B7490]">Notes:</Text>
          <Text className="mt-0.5 text-sm text-[#A3ACBF]">{notes}</Text>
        </View>
      ) : null}
    </ContentCard>
  );
}
