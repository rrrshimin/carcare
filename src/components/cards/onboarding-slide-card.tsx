import { Text, View } from 'react-native';

import { ContentCard } from '@/components/cards/content-card';

type OnboardingSlideCardProps = {
  title: string;
  description: string;
  index: number;
  total: number;
};

export function OnboardingSlideCard({ title, description, index, total }: OnboardingSlideCardProps) {
  return (
    <ContentCard className="flex-1 items-center justify-center px-6 py-8">
      <View className="h-28 w-28 items-center justify-center rounded-full border border-[#1F2740] bg-[#0051E8]/20">
        <Text className="text-xl font-extrabold text-white">{index + 1}</Text>
      </View>

      <Text className="mt-8 text-center text-3xl font-extrabold text-white">{title}</Text>
      <Text className="mt-4 text-center text-base leading-6 text-white">{description}</Text>

      <Text className="mt-8 text-xs font-semibold tracking-wider text-white">
        STEP {index + 1} OF {total}
      </Text>
    </ContentCard>
  );
}
