import { useMemo, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { OutlineButton } from '@/components/buttons/outline-button';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { LabeledTextInput } from '@/components/inputs/labeled-text-input';
import { OptionPillGroup } from '@/components/inputs/option-pill-group';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { routes } from '@/navigation/routes';
import { createVehicle } from '@/services/vehicle-service';
import { SetupFlowStackParamList } from '@/types/navigation';
import { DistanceUnit, FuelType, Transmission } from '@/types/vehicle';

type Props = NativeStackScreenProps<SetupFlowStackParamList, typeof routes.addVehicle>;

type FormState = {
  imageUri: string;
  name: string;
  year: string;
  fuelType: FuelType;
  transmission: Transmission;
  odometer: string;
  unit: DistanceUnit;
};

const fuelTypeOptions: FuelType[] = ['petrol', 'diesel', 'hybrid', 'electric'];
const transmissionOptions: Transmission[] = ['automatic', 'manual'];
const unitOptions: DistanceUnit[] = ['km', 'mi'];

export function AddVehicleScreen({ navigation }: Props) {
  const [form, setForm] = useState<FormState>({
    imageUri: '',
    name: '',
    year: '',
    fuelType: 'petrol',
    transmission: 'automatic',
    odometer: '',
    unit: 'km',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    const parsedYear = Number(form.year);
    const parsedOdometer = Number(form.odometer);

    if (!form.name.trim()) {
      return 'Vehicle name is required.';
    }
    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > currentYear + 1) {
      return 'Please enter a valid vehicle year.';
    }
    if (!Number.isFinite(parsedOdometer) || parsedOdometer < 0) {
      return 'Current odometer must be a non-negative number.';
    }

    return null;
  }

  async function handlePickImage() {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setError('Photo permission is required to select a vehicle image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      updateForm('imageUri', result.assets[0].uri);
      setError(null);
    } catch {
      setError('Unable to open photo library. Please try again.');
    }
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await createVehicle({
        imageUri: form.imageUri,
        name: form.name,
        year: Number(form.year),
        fuelType: form.fuelType,
        transmission: form.transmission,
        currentOdometer: Number(form.odometer),
        unit: form.unit,
      });

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routes.appFlow }],
        }),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to create vehicle. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <ScreenTitleBlock title="Add Vehicle" subtitle="Create your first vehicle to continue." />

      <View className="gap-2">
        <Text className="text-sm text-[#A3ACBF]">Vehicle Photo</Text>
        <OutlineButton
          className="items-center"
          textClassName="text-[#A3ACBF]"
          label={form.imageUri ? 'Change Photo' : 'Upload Photo'}
          onPress={handlePickImage}
        />
        {form.imageUri ? (
          <Image
            source={{ uri: form.imageUri }}
            className="h-44 w-full rounded-xl border border-[#1F2740] bg-[#141A2B]"
            resizeMode="cover"
          />
        ) : null}
      </View>
      <LabeledTextInput
        label="Vehicle Name"
        placeholder="Toyota Supra"
        value={form.name}
        onChangeText={(value) => updateForm('name', value)}
      />
      <LabeledTextInput
        label="Year"
        placeholder="2020"
        keyboardType="number-pad"
        value={form.year}
        onChangeText={(value) => updateForm('year', value)}
      />

      <OptionPillGroup<FuelType>
        label="Fuel Type"
        options={fuelTypeOptions}
        selected={form.fuelType}
        onSelect={(value) => updateForm('fuelType', value)}
      />
      <OptionPillGroup<Transmission>
        label="Transmission"
        options={transmissionOptions}
        selected={form.transmission}
        onSelect={(value) => updateForm('transmission', value)}
      />

      <LabeledTextInput
        label="Current Odometer"
        placeholder="120000"
        keyboardType="number-pad"
        value={form.odometer}
        onChangeText={(value) => updateForm('odometer', value)}
      />

      <OptionPillGroup<DistanceUnit>
        label="Unit"
        options={unitOptions}
        selected={form.unit}
        onSelect={(value) => updateForm('unit', value)}
      />

      {error ? <Text className="text-sm text-[#FFB020]">{error}</Text> : null}

      <PrimaryButton className="mt-2" disabled={submitting} onPress={handleSubmit} label={submitting ? 'Adding...' : 'Add'} />
    </ScrollView>
  );
}
