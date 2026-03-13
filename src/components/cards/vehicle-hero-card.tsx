import { Dimensions, Image, Text, View } from 'react-native';

import { OutlineButton } from '@/components/buttons/outline-button';
import { ContentCard } from '@/components/cards/content-card';
import { Vehicle } from '@/types/vehicle';

type VehicleHeroCardProps = {
  vehicle: Vehicle;
  onPressShare: () => void;
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Vehicle image takes 30% of screen height. Tweak multiplier to resize hero area.
const IMAGE_HEIGHT = Math.round(Dimensions.get('window').height * 0.3);
// Info card overlaps the image bottom by 10% of image height for a layered look.
const IMAGE_OVERLAP = Math.round(IMAGE_HEIGHT * 0.1);

// ── Vehicle hero card (Home screen top) ──────────────────────────────
// Full-width image header + overlapping info card with vehicle details and Share button.
// This component defines the most prominent visual area of the home screen.
export function VehicleHeroCard({ vehicle, onPressShare }: VehicleHeroCardProps) {
  return (
    <View>
      {/* Hero image area: full width, 30% screen height. Placeholder shows car emoji. */}
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

      {/* Info card: overlaps image via negative marginTop. mx-4 = 16px horizontal inset. Center-aligned text. */}
      <ContentCard className="mx-4 items-center" style={{ marginTop: -IMAGE_OVERLAP }}>
        {/* Vehicle name: 28px ExtraBold, centered */}
        <Text className="text-center text-[28px] font-extrabold leading-tight text-white">{vehicle.name}</Text>
        {/* Vehicle meta line: year, fuel, transmission. Capitalized values, centered. */}
        <Text className="mt-1 text-center text-sm text-[#A3ACBF]">
          {vehicle.year} {'\u00B7'} {capitalize(vehicle.fuelType)} {'\u00B7'} {capitalize(vehicle.transmission)}
        </Text>

        {/* Share button centered (Update Mileage lives in MileageCard below) */}
        <View className="mt-4 w-full">
          <OutlineButton
            className="items-center justify-center w-full bg-[#0C111F] px-8"
            textClassName="text-center text-white"
            label="Share"
            onPress={onPressShare}
          />
        </View>
      </ContentCard>
    </View>
  );
}
