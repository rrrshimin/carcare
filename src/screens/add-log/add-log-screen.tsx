import { useState } from 'react';
import { ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { LabeledMultilineInput } from '@/components/inputs/labeled-multiline-input';
import { LabeledTextInput } from '@/components/inputs/labeled-text-input';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { routes } from '@/navigation/routes';
import { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.addLog>;

export function AddLogScreen({ navigation, route }: Props) {
  const { logTypeName } = route.params ?? {};
  const [mileage, setMileage] = useState('');
  const [specification, setSpecification] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <ScreenTitleBlock title="Add Log" subtitle={logTypeName ? `For: ${logTypeName}` : 'Select details below.'} />

      <LabeledTextInput label="Changed At (km/mi)" value={mileage} onChangeText={setMileage} keyboardType="number-pad" />
      <LabeledTextInput label="Specification" value={specification} onChangeText={setSpecification} />
      <LabeledMultilineInput label="Notes" placeholder="Optional notes" value={notes} onChangeText={setNotes} />

      <PrimaryButton label="Save (UI only)" onPress={() => navigation.navigate(routes.home)} />
    </ScrollView>
  );
}
