import { Dimensions, Image, Text, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const IMAGE_WIDTH = SCREEN_WIDTH * 0.8;
const IMAGE_MAX_HEIGHT = SCREEN_HEIGHT * 0.55;

type OnboardingSlideCardProps = {
  title: string;
  description: string;
  imageSource: ReturnType<typeof require>;
};

export function OnboardingSlideCard({ title, description, imageSource }: OnboardingSlideCardProps) {
  return (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1 items-center justify-center px-6">
      <Image
        source={imageSource}
        resizeMode="contain"
        style={{ width: IMAGE_WIDTH, height: IMAGE_MAX_HEIGHT }}
      />

      <Text className="mt-6 text-center text-3xl font-extrabold text-white">{title}</Text>
      <Text className="mt-3 text-center text-base leading-6 text-white">{description}</Text>
    </View>
  );
}
