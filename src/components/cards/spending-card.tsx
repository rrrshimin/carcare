import { Image, Pressable, Text, View } from 'react-native';

import { ContentCard } from '@/components/cards/content-card';
import { ChevronRightIcon } from '@/components/icons/app-icons';

type SpendingCardProps = {
  line1: string;
  line2?: string | null;
  onPress: () => void;
};

export function SpendingCard({ line1, line2, onPress }: SpendingCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <ContentCard>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="h-14 w-12 items-center justify-center">
              <Image
                source={require('../../icons/icon-spendings.png')}
                className="h-12 w-12"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-extrabold text-white">Spending</Text>
              <Text
                className="text-[13px] pt-0.5 text-[#A3ACBF]"
                numberOfLines={1}
              >
                {line1}
              </Text>
              {line2 ? (
                <Text
                  className="text-[13px] pt-0.5 text-[#A3ACBF]"
                  numberOfLines={1}
                >
                  {line2}
                </Text>
              ) : null}
            </View>
          </View>
          <ChevronRightIcon size={20} color="#A3ACBF" />
        </View>
      </ContentCard>
    </Pressable>
  );
}
