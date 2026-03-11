import { Image, Text, View } from 'react-native';

import { OutlineButton } from '@/components/buttons/outline-button';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { ContentCard } from '@/components/cards/content-card';
import { Vehicle } from '@/types/vehicle';

type VehicleHeroCardProps = {
  vehicle: Vehicle;
  onPressShare: () => void;
  onPressUpdateMileage: () => void;
};

export function VehicleHeroCard({ vehicle, onPressShare, onPressUpdateMileage }: VehicleHeroCardProps) {
  return (
    <ContentCard>
      {vehicle.imageUri ? (
        <Image
          source={{ uri: vehicle.imageUri }}
          className="h-52 w-full rounded-xl border border-[#1F2740] bg-[#0C111F]"
          resizeMode="cover"
        />
      ) : (
        <View className="h-52 w-full items-center justify-center rounded-xl border border-[#1F2740] bg-[#0C111F]">
          <Text className="text-sm font-semibold text-[#A3ACBF]">No vehicle photo</Text>
        </View>
      )}

      <Text className="mt-4 text-2xl font-extrabold text-white">{vehicle.name}</Text>
      <Text className="mt-2 text-sm text-[#A3ACBF]">
        {vehicle.year} - {vehicle.fuelType} - {vehicle.transmission}
      </Text>

      <View className="mt-4 flex-row gap-2">
        <OutlineButton className="flex-1 items-center bg-[#0C111F]" textClassName="text-white" label="Share" onPress={onPressShare} />
        <PrimaryButton className="flex-1" label="Update Mileage" onPress={onPressUpdateMileage} />
      </View>
    </ContentCard>
  );
}
