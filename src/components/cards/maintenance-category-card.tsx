import { Image, Text, View } from 'react-native';

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

// ── Maintenance category card (Home screen) ──────────────────────────
// One card per category (Engine, Brakes, etc.). Contains header row + list of MaintenanceItemRows.
// Wraps ContentCard so base card styles apply. Repeated once per category.
export function MaintenanceCategoryCard({
  category,
  items,
  onPressNewLog,
  onPressItem,
  onPressAddLog,
}: MaintenanceCategoryCardProps) {
  return (
    <ContentCard>
      {/* Header row: icon circle + category name + "New Log" chip */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {/* Category icon: 40×40 circle, dark fill. Falls back to 2-letter abbreviation. */}
          <View className="h-12 w-12 items-center justify-center">
            {category.iconUrl ? (
              <Image
                source={{ uri: category.iconUrl }}
                className="h-12 w-12"
                resizeMode="contain"
              />
            ) : (
              <Text className="text-[10px] font-bold text-[#A3ACBF]">
                {category.name.substring(0, 2).toUpperCase()}
              </Text>
            )}
          </View>
          {/* Category name: 18px ExtraBold white (matches theme.typography.cardTitle) */}
          <Text className="text-lg font-extrabold text-white">{category.name}</Text>
        </View>
        <ActionChipButton className="mt-[5px]" label="New Log" onPress={() => onPressNewLog(category)} />
      </View>

      {/* Items list: mt-2 (8px) gap below header, gap-2 (8px) between rows */}
      <View>
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
