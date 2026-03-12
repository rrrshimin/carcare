import { Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/feedback/status-badge';
import type { ItemDisplay } from '@/types/maintenance';

type MaintenanceItemRowProps = {
  item: ItemDisplay;
  onPressItem: (item: ItemDisplay) => void;
  onPressAddLog: (item: ItemDisplay) => void;
};

export function MaintenanceItemRow({ item, onPressItem, onPressAddLog }: MaintenanceItemRowProps) {
  return (
    <Pressable
      className="rounded-xl  bg-[#0C111F] px-3 py-3"
      onPress={() => onPressItem(item)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : undefined })}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-white">{item.name}</Text>
          <View className="mt-1">
            <StatusBadge label={item.status.label} variant={item.status.variant} />
          </View>
        </View>

        <Pressable
          className="ml-3 rounded-lg border border-[#1F2740] bg-[#141A2B] px-3 py-2"
          onPress={() => onPressAddLog(item)}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : undefined })}
        >
          <Text className="text-xs font-semibold text-[#367DFF]">Add Log</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
