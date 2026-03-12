import { Image, Text, View } from 'react-native';

import { ContentCard } from '@/components/cards/content-card';

type OnboardingSlideCardProps = {
  title: string;
  description: string;
  imageSource: ReturnType<typeof require>;
  index: number;
  total: number;
};

export function OnboardingSlideCard({ title, description, imageSource, index, total }: OnboardingSlideCardProps) {
  return (
    <ContentCard className="flex-1 items-center justify-center px-6 py-8">
      <View className="w-full flex-1 items-center justify-center">
        <Image
          source={imageSource}
          resizeMode="contain"
          className="max-h-[280px] w-full"
          style={{ aspectRatio: 1440 / 2140 }}
        />
      </View>

      <Text className="mt-4 text-center text-3xl font-extrabold text-white">{title}</Text>
      <Text className="mt-4 text-center text-base leading-6 text-white">{description}</Text>

      <Text className="mt-8 text-xs font-semibold tracking-wider text-white">
        {index + 1} OF {total}
      </Text>
    </ContentCard>
  );
}
