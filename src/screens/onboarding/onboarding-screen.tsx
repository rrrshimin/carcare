import { useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { OnboardingSlideCard } from '@/components/cards/onboarding-slide-card';
import { PaginationDots } from '@/components/feedback/pagination-dots';
import { routes } from '@/navigation/routes';
import { setOnboardingCompleted } from '@/services/storage-service';
import { SetupFlowStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<SetupFlowStackParamList, typeof routes.onboarding>;

const SCREEN_WIDTH = Dimensions.get('window').width;

const slides = [
  {
    title: 'Service Made Simple',
    description: 'Track essentials for your vehicle without clutter.',
    image: require('../../../assets/onboarding-1.png'),
  },
  {
    title: 'Track Maintenance',
    description: 'Keep every service record in one place.',
    image: require('../../../assets/onboarding-2.png'),
  },
  {
    title: 'Protect Your Resale Value',
    description: 'Build a clean maintenance history over time.',
    image: require('../../../assets/onboarding-3.png'),
  },
] as const;

export function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isLastSlide = index === slides.length - 1;

  async function handlePrimaryAction() {
    if (!isLastSlide) {
      const nextIndex = index + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setIndex(nextIndex);
      return;
    }

    setSaving(true);
    try {
      await setOnboardingCompleted(true);
      navigation.replace(routes.addVehicle);
    } catch {
      Alert.alert(
        'Something went wrong',
        'Failed to save onboarding progress. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  // ── Onboarding layout ────────────────────────────────────────────────
  // Full-screen dark, safe-area padded. Horizontal paged FlatList for slide content.
  // Bottom area: PaginationDots + PrimaryButton pinned to bottom with px-6 pb-6 padding.
  return (
    <View
      className="flex-1 bg-[#0C111F]"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Horizontal paged slide list. Each slide width = SCREEN_WIDTH for snap. */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
        renderItem={({ item }) => (
          <OnboardingSlideCard
            title={item.title}
            description={item.description}
            imageSource={item.image}
          />
        )}
        style={{ flex: 1 }}
      />

      {/* Bottom controls: dots + button. px-6 (24px) side padding, pb-6 (24px) bottom padding. */}
      <View className="px-6 pb-6">
        <PaginationDots count={slides.length} activeIndex={index} />
        <PrimaryButton
          className="mt-6"
          disabled={saving}
          onPress={handlePrimaryAction}
          label={isLastSlide ? (saving ? 'Saving...' : 'Get Started') : 'Continue'}
        />
      </View>
    </View>
  );
}
