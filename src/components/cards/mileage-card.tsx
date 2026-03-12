import { Text, View } from 'react-native';

import { ActionChipButton } from '@/components/buttons/action-chip-button';
import { ContentCard } from '@/components/cards/content-card';
import { DistanceUnit } from '@/types/vehicle';
import { formatMileage } from '@/utils/formatting/format-mileage';

type MileageCardProps = {
  currentOdometer: number;
  unit: DistanceUnit;
  onPressUpdate: () => void;
};

export function MileageCard({ currentOdometer, unit, onPressUpdate }: MileageCardProps) {
  return (
    <ContentCard>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full border border-[#1F2740] bg-[#0C111F]">
            <Text className="text-base">🛣</Text>
          </View>
          <View>
            <Text className="text-xs text-[#A3ACBF]">Current Mileage</Text>
            <Text className="text-lg font-extrabold text-white">
              {formatMileage(currentOdometer, unit)}
            </Text>
          </View>
        </View>

        <ActionChipButton label="Update" onPress={onPressUpdate} />
      </View>
    </ContentCard>
  );
}
