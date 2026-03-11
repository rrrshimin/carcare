import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionChipButton } from '@/components/buttons/action-chip-button';
import { OutlineButton } from '@/components/buttons/outline-button';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { ContentCard } from '@/components/cards/content-card';
import { MaintenanceCategoryCard } from '@/components/cards/maintenance-category-card';
import { OnboardingSlideCard } from '@/components/cards/onboarding-slide-card';
import { VehicleHeroCard } from '@/components/cards/vehicle-hero-card';
import { PaginationDots } from '@/components/feedback/pagination-dots';
import { StatusBadge } from '@/components/feedback/status-badge';
import { LabeledMultilineInput } from '@/components/inputs/labeled-multiline-input';
import { LabeledTextInput } from '@/components/inputs/labeled-text-input';
import { OptionPillGroup } from '@/components/inputs/option-pill-group';
import { SectionHeader } from '@/components/layout/section-header';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { HistoryLogRow } from '@/components/lists/history-log-row';
import { LogTypeRow } from '@/components/lists/log-type-row';
import { MaintenanceItemRow } from '@/components/lists/maintenance-item-row';
import { maintenanceCategories, maintenanceItems } from '@/constants/maintenance-catalog';
import { MaintenanceItem } from '@/types/maintenance';
import { Vehicle } from '@/types/vehicle';

const demoVehicle: Vehicle = {
  id: 'vehicle-demo',
  name: 'Toyota Supra',
  year: 2021,
  fuelType: 'petrol',
  transmission: 'automatic',
  currentOdometer: 142300,
  unit: 'km',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const fuelTypeOptions = ['petrol', 'diesel', 'hybrid', 'electric'] as const;

export function UIPlaygroundScreen() {
  const [inputValue, setInputValue] = useState('120000');
  const [notesValue, setNotesValue] = useState('Changed at dealership.');
  const [selectedFuel, setSelectedFuel] = useState<(typeof fuelTypeOptions)[number]>('petrol');
  const [activeDot, setActiveDot] = useState(1);
  const [buttonState, setButtonState] = useState<'idle' | 'loading'>('idle');

  const sampleItem: MaintenanceItem = useMemo(
    () => ({
      id: 'engine-oil-demo',
      categoryId: 'engine',
      name: 'Engine Oil',
      statusText: 'Service status pending',
    }),
    [],
  );

  const engineItems = useMemo(() => maintenanceItems.filter((item) => item.categoryId === 'engine').slice(0, 2), []);

  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <ScreenTitleBlock
        title="UI Playground"
        subtitle="Temporary visual sandbox for reusable components."
      />

      <ContentCard>
        <SectionHeader title="Buttons" subtitle="Primary, outline, and action chip variants" />
        <View className="mt-3 gap-2">
          <PrimaryButton
            label={buttonState === 'loading' ? 'Loading...' : 'Primary Button'}
            onPress={() => setButtonState((prev) => (prev === 'idle' ? 'loading' : 'idle'))}
          />
          <PrimaryButton label="Disabled Primary" disabled />
          <View className="flex-row flex-wrap gap-2">
            <OutlineButton label="Outline Button" />
            <OutlineButton label="Warning Outline" className="border-[#FFB020]" textClassName="text-[#FFB020]" />
            <ActionChipButton label="Action Chip" />
          </View>
        </View>
      </ContentCard>

      <ContentCard>
        <SectionHeader title="Inputs" subtitle="Text, multiline and selection controls" />
        <View className="mt-3 gap-3">
          <LabeledTextInput label="Mileage" value={inputValue} onChangeText={setInputValue} keyboardType="number-pad" />
          <LabeledMultilineInput label="Notes" value={notesValue} onChangeText={setNotesValue} />
          <OptionPillGroup
            label="Fuel Type"
            options={[...fuelTypeOptions]}
            selected={selectedFuel}
            onSelect={setSelectedFuel}
          />
        </View>
      </ContentCard>

      <ContentCard>
        <SectionHeader title="Feedback" subtitle="Status badges and pagination dots" />
        <View className="mt-3 flex-row flex-wrap items-center gap-3">
          <StatusBadge label="Service status pending" />
          <StatusBadge label="Due soon in 800 km" tone="warning" />
        </View>
        <View className="mt-4">
          <PaginationDots count={3} activeIndex={activeDot} />
          <View className="mt-3 flex-row gap-2">
            <ActionChipButton label="Prev Dot" onPress={() => setActiveDot((prev) => Math.max(prev - 1, 0))} />
            <ActionChipButton label="Next Dot" onPress={() => setActiveDot((prev) => Math.min(prev + 1, 2))} />
          </View>
        </View>
      </ContentCard>

      <OnboardingSlideCard
        title="Service Made Simple"
        description="Track essentials for your vehicle without clutter."
        index={1}
        total={3}
      />

      <VehicleHeroCard
        vehicle={demoVehicle}
        onPressShare={() => undefined}
        onPressUpdateMileage={() => undefined}
      />

      <MaintenanceCategoryCard
        category={maintenanceCategories[0]}
        items={engineItems}
        onPressNewLog={() => undefined}
        onPressItem={() => undefined}
        onPressAddLog={() => undefined}
      />

      <MaintenanceItemRow item={sampleItem} onPressItem={() => undefined} onPressAddLog={() => undefined} />

      <LogTypeRow title="Engine Oil" subtitle="Open Add Log form" onPress={() => undefined} />

      <HistoryLogRow
        specification="5W-30"
        mileage="141,200 km"
        date="18 Dec 2024"
        notes="Changed at dealership"
      />

      <Text className="pb-8 text-center text-xs text-[#A3ACBF]">
        UI playground is temporary and intended for component tweaking.
      </Text>
    </ScrollView>
  );
}
