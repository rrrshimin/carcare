import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

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

function formatWithCommas(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function AddVehicleScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
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
  const odometerDisplay = form.odometer ? formatWithCommas(form.odometer) : '';

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleYearChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    updateForm('year', digits);
  }

  function handleOdometerChange(text: string) {
    const digits = text.replace(/\D/g, '');
    updateForm('odometer', digits);
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

  // Inline km/mi toggle rendered inside the odometer input's rightElement slot.
  // Selected: brand blue fill. Unselected: dark background fill.
  const unitToggle = (
    <View className="mr-2 flex-row items-center gap-1">
      {unitOptions.map((u) => (
        <Pressable
          key={u}
          className={
            form.unit === u
              ? 'rounded-lg bg-[#0051E8] px-3 py-1.5'
              : 'rounded-lg bg-[#0C111F] px-3 py-1.5'
          }
          onPress={() => updateForm('unit', u)}
        >
          <Text
            className={
              form.unit === u
                ? 'text-xs font-semibold text-white'
                : 'text-xs font-semibold text-[#A3ACBF]'
            }
          >
            {u}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  // ── Add Vehicle form layout ──────────────────────────────────────────
  // ScrollView fills the screen. paddingTop accounts for safe area + extra 60px offset.
  // paddingHorizontal 16px = screen margin. gap 12px between form fields.
  // paddingBottom 32px = breathing room at bottom.
  return (
    <ScrollView
      className="flex-1 bg-[#0C111F]"
      contentContainerStyle={{
        paddingTop: insets.top + 60,
        paddingHorizontal: 16,
        paddingBottom: 32,
        gap: 12,
      }}
    >
      <ScreenTitleBlock title="Add Vehicle" subtitle="Let's add your vehicle to start tracking maintenance." />

      {/* Vehicle photo upload area: h-44 (176px) tall.
          Empty state: dashed border placeholder. Filled state: image with card border. */}
      <View className="gap-2">
        <Text className="text-sm text-[#A3ACBF]">Vehicle Photo</Text>
        {form.imageUri ? (
          <Pressable onPress={handlePickImage}>
            <Image
              source={{ uri: form.imageUri }}
              className="h-44 w-full rounded-xl border border-[#1F2740] bg-[#141A2B]"
              resizeMode="cover"
            />
          </Pressable>
        ) : (
          <Pressable
            className="h-44 w-full items-center justify-center rounded-xl"
            style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}
            onPress={handlePickImage}
          >
            <Text className="text-2xl text-[#A3ACBF]">+</Text>
            <Text className="mt-1 text-sm text-[#A3ACBF]">Upload Photo</Text>
          </Pressable>
        )}
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
        maxLength={4}
        value={form.year}
        onChangeText={handleYearChange}
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
        label={`Current Odometer (${form.unit})`}
        placeholder="0"
        keyboardType="number-pad"
        value={odometerDisplay}
        onChangeText={handleOdometerChange}
        rightElement={unitToggle}
      />

      {/* Form error text: warning amber #FFB020, 14px */}
      {error ? <Text className="text-sm text-[#FFB020]">{error}</Text> : null}

      <PrimaryButton className="mt-2" disabled={submitting} onPress={handleSubmit} label={submitting ? 'Adding...' : 'Add'} />
    </ScrollView>
  );
}
