import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

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
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-[#0C111F] px-6 py-10">
      <View className="flex-1 items-center justify-center rounded-2xl border border-[#1F2740] bg-[#141A2B] px-6">
        <View className="h-28 w-28 rounded-full bg-[#0051E8]/20" />
        <Text className="mt-8 text-center text-3xl font-extrabold text-white">
          {currentSlide.title}
        </Text>
        <Text className="mt-4 text-center text-base text-[#A3ACBF]">{currentSlide.description}</Text>
      </View>

      <View className="mt-6 flex-row items-center justify-center gap-2">
        {slides.map((slide, slideIndex) => (
          <View
            key={slide.title}
            className={slideIndex === index ? 'h-2 w-6 rounded-full bg-[#0051E8]' : 'h-2 w-2 rounded-full bg-[#1F2740]'}
          />
        ))}
      </View>

      <Pressable
        className="mt-6 items-center rounded-xl bg-[#0051E8] py-4"
        disabled={saving}
        onPress={handlePrimaryAction}
      >
        <Text className="text-base font-bold text-white">
          {isLastSlide ? (saving ? 'Saving...' : 'Get Started') : 'Continue'}
        </Text>
      </Pressable>
    </View>
  );
}
