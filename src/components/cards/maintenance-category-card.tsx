import { Text, View } from 'react-native';

import { ActionChipButton } from '@/components/buttons/action-chip-button';
import { ContentCard } from '@/components/cards/content-card';
import { MaintenanceItemRow } from '@/components/lists/maintenance-item-row';
import { MaintenanceCategory, MaintenanceItem } from '@/types/maintenance';

type MaintenanceCategoryCardProps = {
  category: MaintenanceCategory;
  items: MaintenanceItem[];
  onPressNewLog: (category: MaintenanceCategory) => void;
  onPressItem: (item: MaintenanceItem) => void;
  onPressAddLog: (item: MaintenanceItem) => void;
};

export function MaintenanceCategoryCard({
  category,
  items,
  onPressNewLog,
  onPressItem,
  onPressAddLog,
}: MaintenanceCategoryCardProps) {
  return (
    <ContentCard>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-full border border-[#1F2740] bg-[#0C111F]">
            <Text className="text-[10px] font-bold text-[#A3ACBF]">{category.icon}</Text>
          </View>
          <Text className="text-lg font-bold text-white">{category.name}</Text>
        </View>
        <ActionChipButton label="New Log" onPress={() => onPressNewLog(category)} />
      </View>

      <View className="mt-3 gap-2">
        {items.map((item) => (
          <MaintenanceItemRow key={item.id} item={item} onPressItem={onPressItem} onPressAddLog={onPressAddLog} />
        ))}
      </View>
    </ContentCard>
  );
}
