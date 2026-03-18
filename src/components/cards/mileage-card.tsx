import { Image, Pressable, Text, View } from 'react-native';

import { ContentCard } from '@/components/cards/content-card';
import { DistanceUnit } from '@/types/vehicle';
import { formatMileage } from '@/utils/formatting/format-mileage';

type MileageCardProps = {
  currentOdometer: number;
  unit: DistanceUnit;
  onPressUpdate?: () => void;
};

// ── Mileage display card (Home screen) ───────────────────────────────
// Shows current odometer with an inline "Update" button.
// Wraps ContentCard so it inherits base card styling.
export function MileageCard({ currentOdometer, unit, onPressUpdate }: MileageCardProps) {
  return (
    <ContentCard>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {/* Icon circle: 40×40, dark fill, subtle border. Image asset: assets/icon-mileage.png */}
          <View className="h-12 w-12 items-center justify-center">
            <Image
              source={require('../../../assets/icon-mileage.png')}
              className="h-12 w-12"
              resizeMode="contain"
            />
          </View>
          <View>
            {/* Label: 12px secondary gray. Value: 18px ExtraBold white. */}
            <Text className="text-xs text-[#A3ACBF]">Current Mileage</Text>
            <Text className="text-lg font-extrabold text-white">
              {formatMileage(currentOdometer, unit)}
            </Text>
          </View>
        </View>

        {onPressUpdate ? (
          <Pressable
            className="min-h-10 items-center justify-center rounded-lg bg-[#0051E8] px-6 py-2"
            onPress={onPressUpdate}
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : undefined })}
          >
            <Text className="text-sm font-semibold text-white">Update</Text>
          </Pressable>
        ) : null}
      </View>
    </ContentCard>
  );
}
