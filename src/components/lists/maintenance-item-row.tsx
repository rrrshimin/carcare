import { Pressable, Text, View } from 'react-native';

import { ActionChipButton } from '@/components/buttons/action-chip-button';
import { ContentCard } from '@/components/cards/content-card';
import { StatusBadge } from '@/components/feedback/status-badge';
import { MaintenanceItem } from '@/types/maintenance';

type MaintenanceItemRowProps = {
  item: MaintenanceItem;
  onPressItem: (item: MaintenanceItem) => void;
  onPressAddLog: (item: MaintenanceItem) => void;
};

export function MaintenanceItemRow({ item, onPressItem, onPressAddLog }: MaintenanceItemRowProps) {
  return (
    <ContentCard className="rounded-xl bg-[#0C111F] px-3 py-3">
      <Pressable onPress={() => onPressItem(item)}>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-white">{item.name}</Text>
          <Text className="text-sm text-[#A3ACBF]">{'>'}</Text>
        </View>
        <View className="mt-1">
          <StatusBadge label={item.statusText} />
        </View>
      </Pressable>
      <ActionChipButton label="Add Log" className="mt-3 bg-[#141A2B]" onPress={() => onPressAddLog(item)} />
    </ContentCard>
  );
}
