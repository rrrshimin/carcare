import { Text, View } from 'react-native';

import { ActionChipButton } from '@/components/buttons/action-chip-button';
import { ContentCard } from '@/components/cards/content-card';
import { MaintenanceItemRow } from '@/components/lists/maintenance-item-row';
import type { CategoryDisplay, ItemDisplay } from '@/types/maintenance';

type MaintenanceCategoryCardProps = {
  category: CategoryDisplay;
  items: ItemDisplay[];
  onPressNewLog: (category: CategoryDisplay) => void;
  onPressItem: (item: ItemDisplay) => void;
  onPressAddLog: (item: ItemDisplay) => void;
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
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#0C111F]">
            <Text className="text-[10px] font-bold text-[#A3ACBF]">{category.icon}</Text>
          </View>
          <Text className="text-lg font-extrabold text-white">{category.name}</Text>
        </View>
        <ActionChipButton label="New Log" onPress={() => onPressNewLog(category)} />
      </View>

      <View className="mt-3 gap-2">
        {items.map((item) => (
          <MaintenanceItemRow
            key={item.id}
            item={item}
            onPressItem={onPressItem}
            onPressAddLog={onPressAddLog}
          />
        ))}
      </View>
    </ContentCard>
  );
}
