import { Dimensions, Image, Pressable, Text, View } from 'react-native';

import { OutlineButton } from '@/components/buttons/outline-button';
import { ContentCard } from '@/components/cards/content-card';
import { ThreeDotsIcon } from '@/components/icons/app-icons';
import { Vehicle } from '@/types/vehicle';

type VehicleHeroCardProps = {
  vehicle: Vehicle;
  onPressShare?: () => void;
  onPressOptions?: () => void;
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const IMAGE_HEIGHT = Math.round(Dimensions.get('window').height * 0.35);
const IMAGE_OVERLAP = Math.round(IMAGE_HEIGHT * 0.1);

export function VehicleHeroCard({ vehicle, onPressShare, onPressOptions }: VehicleHeroCardProps) {
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
          <Text className="text-4xl">{'\uD83D\uDE97'}</Text>
        </View>
      )}

      <ContentCard className="mx-4 items-center" style={{ marginTop: -IMAGE_OVERLAP }}>
        <Text className="text-center text-[28px] font-extrabold leading-tight text-white">
          {vehicle.name}
        </Text>
        <Text className="mt-1 text-center text-sm text-[#A3ACBF]">
          {vehicle.year} {'\u00B7'} {capitalize(vehicle.fuelType)} {'\u00B7'}{' '}
          {capitalize(vehicle.transmission)}
        </Text>

        <View className="mt-4 w-full flex-row items-center gap-3">
          {onPressShare ? (
            <View className="flex-1">
              <OutlineButton
                className="items-center justify-center w-full bg-[#0C111F] px-8"
                textClassName="text-center text-white"
                label="Share"
                onPress={onPressShare}
              />
            </View>
          ) : (
            <View className="flex-1" />
          )}
          {onPressOptions ? (
            <Pressable
              onPress={onPressOptions}
              className="h-11 w-11 items-center justify-center rounded-xl border border-[#1F2740]"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <ThreeDotsIcon size={15} />
            </Pressable>
          ) : null}
        </View>
      </ContentCard>
    </View>
  );
}
