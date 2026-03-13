import { Dimensions, Image, Text, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
// Illustration takes 80% of screen width and up to 55% of screen height.
const IMAGE_WIDTH = SCREEN_WIDTH * 0.8;
const IMAGE_MAX_HEIGHT = SCREEN_HEIGHT * 0.55;

type OnboardingSlideCardProps = {
  title: string;
  description: string;
  imageSource: ReturnType<typeof require>;
};

// ── Single onboarding slide ──────────────────────────────────────────
// Three of these render in a horizontal FlatList on OnboardingScreen.
// Each slide is exactly one screen width (for paging snap).
// Image assets: assets/onboarding-1.png, onboarding-2.png, onboarding-3.png.
export function OnboardingSlideCard({ title, description, imageSource }: OnboardingSlideCardProps) {
  return (
    // width = SCREEN_WIDTH locks each slide to full viewport for paging.
    // px-6 (24px) gives horizontal text padding.
    <View style={{ width: SCREEN_WIDTH }} className="flex-1 items-center justify-center px-6">
      <Image
        source={imageSource}
        resizeMode="contain"
        style={{ width: IMAGE_WIDTH, height: IMAGE_MAX_HEIGHT }}
      />

      {/* Title: 30px ExtraBold white. Description: 16px regular white. */}
      <Text className="mt-6 text-center text-3xl font-extrabold text-white">{title}</Text>
      <Text className="mt-3 text-center text-base leading-6 text-white">{description}</Text>
    </View>
  );
}
