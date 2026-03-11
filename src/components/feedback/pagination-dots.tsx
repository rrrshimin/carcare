import { View } from 'react-native';

type PaginationDotsProps = {
  count: number;
  activeIndex: number;
};

export function PaginationDots({ count, activeIndex }: PaginationDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        return (
          <View
            key={dotIndex}
            className={isActive ? 'h-2 w-8 rounded-full bg-[#0051E8]' : 'h-2 w-2 rounded-full bg-[#1F2740]'}
          />
        );
      })}
    </View>
  );
}
