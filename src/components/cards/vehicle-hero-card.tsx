import { Dimensions, Image, Text, View } from 'react-native';

import { OutlineButton } from '@/components/buttons/outline-button';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { ContentCard } from '@/components/cards/content-card';
import { Vehicle } from '@/types/vehicle';

type VehicleHeroCardProps = {
  vehicle: Vehicle;
  onPressShare: () => void;
  onPressUpdateMileage: () => void;
};

const IMAGE_HEIGHT = Math.round(Dimensions.get('window').height * 0.3);

export function VehicleHeroCard({ vehicle, onPressShare, onPressUpdateMileage }: VehicleHeroCardProps) {
  return (
    <ContentCard>
      {vehicle.imageUri ? (
        <Image
          source={{ uri: vehicle.imageUri }}
          style={{ height: IMAGE_HEIGHT }}
          className="w-full rounded-xl border border-[#1F2740] bg-[#0C111F]"
          resizeMode="cover"
        />
      ) : (
        <Image
          source={require('../../../assets/vehicle-placeholder.png')}
          style={{ height: IMAGE_HEIGHT }}
          className="w-full rounded-xl border border-[#1F2740] bg-[#0C111F]"
          resizeMode="cover"
        />
      )}

      <Text className="mt-4 text-[28px] font-extrabold leading-tight text-white">{vehicle.name}</Text>
      <Text className="mt-1 text-sm text-[#A3ACBF]">
        {vehicle.year} · {vehicle.fuelType} · {vehicle.transmission}
      </Text>

      <View className="mt-4 flex-row gap-3">
        <OutlineButton
          className="flex-1 items-center bg-[#0C111F]"
          textClassName="text-center text-white"
          label="Share"
          onPress={onPressShare}
        />
        <PrimaryButton className="flex-1" label="Update Mileage" onPress={onPressUpdateMileage} />
      </View>
    </ContentCard>
  );
}
