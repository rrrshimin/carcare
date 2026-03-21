import { Dimensions, Image, Pressable, Text, View } from 'react-native';

import { ContentCard } from '@/components/cards/content-card';
import { ChevronDownIcon } from '@/components/icons/app-icons';
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

      <ContentCard className="mx-4 py-5 items-center" style={{ marginTop: -IMAGE_OVERLAP }}>
        <Text className="text-center text-[28px] font-extrabold leading-tight text-white">
          {vehicle.name}
        </Text>
        <Text className="mt-1 text-center text-sm text-[#A3ACBF]">
          {vehicle.year} {'\u00B7'} {capitalize(vehicle.fuelType)} {'\u00B7'}{' '}
          {capitalize(vehicle.transmission)}
        </Text>

        <View className="mt-4 w-full flex-row items-center gap-3">
          {onPressShare ? (
            <Pressable
              onPress={onPressShare}
              className="min-h-12 flex-1 flex-row items-center justify-center rounded-xl border border-[#1F2740] px-4 py-3"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Text
                className="text-sm text-white"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Share
              </Text>
            </Pressable>
          ) : (
            <View className="flex-1" />
          )}
          {onPressOptions ? (
            <Pressable
              onPress={onPressOptions}
              className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-[#1F2740] px-4 py-3"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Text
                className="text-sm text-white"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Actions
              </Text>
              <ChevronDownIcon size={14} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>
      </ContentCard>
    </View>
  );
}
