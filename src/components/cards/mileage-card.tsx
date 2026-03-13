import { Image, Pressable, Text, View } from 'react-native';

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
            <Image
              source={require('../../../assets/icon-mileage.png')}
              className="h-5 w-5"
              resizeMode="contain"
            />
          </View>
          <View>
            <Text className="text-xs text-[#A3ACBF]">Current Mileage</Text>
            <Text className="text-lg font-extrabold text-white">
              {formatMileage(currentOdometer, unit)}
            </Text>
          </View>
        </View>

        <Pressable
          className="min-h-9 items-center justify-center rounded-lg bg-[#0051E8] px-4 py-2"
          onPress={onPressUpdate}
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : undefined })}
        >
          <Text className="text-xs font-semibold text-white">Update</Text>
        </Pressable>
      </View>
    </ContentCard>
  );
}
