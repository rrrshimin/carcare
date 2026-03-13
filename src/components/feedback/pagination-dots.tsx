import { View } from 'react-native';

type PaginationDotsProps = {
  count: number;
  activeIndex: number;
};

// ── Pagination dots (onboarding) ─────────────────────────────────────
// Active dot: pill shape (h-2 w-8 = 8×32px), brand blue #0051E8.
// Inactive dot: circle (h-2 w-2 = 8×8px), border color #1F2740.
// gap-2 (8px) between dots. Centered horizontally.
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
