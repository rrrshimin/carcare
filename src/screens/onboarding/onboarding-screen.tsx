import { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { OnboardingSlideCard } from '@/components/cards/onboarding-slide-card';
import { PaginationDots } from '@/components/feedback/pagination-dots';
import { routes } from '@/navigation/routes';
import { setOnboardingCompleted } from '@/services/storage-service';
import { SetupFlowStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<SetupFlowStackParamList, typeof routes.onboarding>;

const slides = [
  {
    title: 'Service Made Simple',
    description: 'Track essentials for your vehicle without clutter.',
  },
  {
    title: 'Track Maintenance',
    description: 'Keep every service record in one place.',
  },
  {
    title: 'Protect Your Resale Value',
    description: 'Build a clean maintenance history over time.',
  },
] as const;

export function OnboardingScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const currentSlide = useMemo(() => slides[index], [index]);
  const isLastSlide = index === slides.length - 1;

  async function handlePrimaryAction() {
    if (!isLastSlide) {
      setIndex((prev) => prev + 1);
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

  return (
    <View className="flex-1 bg-[#0C111F] px-6 py-8">
      <View className="mb-4">
        <Text className="text-center text-xl font-extrabold text-white">CarCare Diary</Text>
        <Text className="mt-1 text-center text-sm text-white">Welcome to your maintenance companion</Text>
      </View>

      <OnboardingSlideCard
        title={currentSlide.title}
        description={currentSlide.description}
        index={index}
        total={slides.length}
      />

      <View className="mt-6">
        <PaginationDots count={slides.length} activeIndex={index} />
      </View>

      <PrimaryButton
        className="mt-6"
        disabled={saving}
        onPress={handlePrimaryAction}
        label={isLastSlide ? (saving ? 'Saving...' : 'Get Started') : 'Continue'}
      />
    </View>
  );
}
