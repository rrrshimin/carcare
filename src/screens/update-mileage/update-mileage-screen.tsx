import { useState } from 'react';
import { ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { LabeledTextInput } from '@/components/inputs/labeled-text-input';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { routes } from '@/navigation/routes';
import { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.updateMileage>;

export function UpdateMileageScreen({ navigation }: Props) {
  const [mileage, setMileage] = useState('');

  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <ScreenTitleBlock title="Update Mileage" />

      <LabeledTextInput
        label="New Mileage Value"
        placeholder="Enter mileage"
        keyboardType="number-pad"
        value={mileage}
        onChangeText={setMileage}
      />

      <PrimaryButton label="Update (UI only)" onPress={() => navigation.navigate(routes.home)} />
    </ScrollView>
  );
}
