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
const IMAGE_OVERLAP = Math.round(IMAGE_HEIGHT * 0.1);

export function VehicleHeroCard({ vehicle, onPressShare, onPressUpdateMileage }: VehicleHeroCardProps) {
  return (
    <View>
      {vehicle.imageUri ? (
        <Image
          source={{ uri: vehicle.imageUri }}
          style={{ height: IMAGE_HEIGHT, width: Dimensions.get('window').width }}
          className="bg-[#141A2B]"
          resizeMode="cover"
        />
      ) : (
        <View
          style={{ height: IMAGE_HEIGHT, width: Dimensions.get('window').width }}
          className="items-center justify-center bg-[#141A2B]"
        >
          <Text className="text-4xl">🚗</Text>
        </View>
      )}

      <ContentCard className="mx-4" style={{ marginTop: -IMAGE_OVERLAP }}>
        <Text className="text-[28px] font-extrabold leading-tight text-white">{vehicle.name}</Text>
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
    </View>
  );
}
