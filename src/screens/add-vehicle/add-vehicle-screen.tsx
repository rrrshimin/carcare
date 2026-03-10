import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { routes } from '@/navigation/routes';
import { createVehicle } from '@/services/vehicle-service';
import { RootStackParamList, SetupFlowStackParamList } from '@/types/navigation';
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

      const rootNavigation = navigation.getParent<
        import('@react-navigation/native').NavigationProp<RootStackParamList>
      >();
      rootNavigation?.navigate(routes.appFlow);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text className="text-3xl font-extrabold text-white">Add Vehicle</Text>
      <Text className="text-sm text-[#A3ACBF]">Create your first vehicle to continue.</Text>

      <View className="gap-2">
        <Text className="text-sm text-[#A3ACBF]">Vehicle Photo</Text>
        <Pressable
          className="items-center rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-3"
          onPress={handlePickImage}
        >
          <Text className="text-sm font-semibold text-[#A3ACBF]">
            {form.imageUri ? 'Change Photo' : 'Upload Photo'}
          </Text>
        </Pressable>
        {form.imageUri ? (
          <Image
            source={{ uri: form.imageUri }}
            className="h-44 w-full rounded-xl border border-[#1F2740] bg-[#141A2B]"
            resizeMode="cover"
          />
        ) : null}
      </View>
      <LabeledInput
        label="Vehicle Name"
        placeholder="Toyota Supra"
        value={form.name}
        onChangeText={(value) => updateForm('name', value)}
      />
      <LabeledInput
        label="Year"
        placeholder="2020"
        keyboardType="number-pad"
        value={form.year}
        onChangeText={(value) => updateForm('year', value)}
      />

      <OptionGroup<FuelType>
        label="Fuel Type"
        options={fuelTypeOptions}
        selected={form.fuelType}
        onSelect={(value) => updateForm('fuelType', value)}
      />
      <OptionGroup<Transmission>
        label="Transmission"
        options={transmissionOptions}
        selected={form.transmission}
        onSelect={(value) => updateForm('transmission', value)}
      />

      <LabeledInput
        label="Current Odometer"
        placeholder="120000"
        keyboardType="number-pad"
        value={form.odometer}
        onChangeText={(value) => updateForm('odometer', value)}
      />

      <OptionGroup<DistanceUnit>
        label="Unit"
        options={unitOptions}
        selected={form.unit}
        onSelect={(value) => updateForm('unit', value)}
      />

      {error ? <Text className="text-sm text-[#FFB020]">{error}</Text> : null}

      <Pressable
        className="mt-2 items-center rounded-xl bg-[#0051E8] py-4"
        disabled={submitting}
        onPress={handleSubmit}
      >
        <Text className="text-base font-bold text-white">{submitting ? 'Adding...' : 'Add'}</Text>
      </Pressable>
    </ScrollView>
  );
}

type LabeledInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'number-pad';
};

function LabeledInput({ label, placeholder, value, onChangeText, keyboardType = 'default' }: LabeledInputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-[#A3ACBF]">{label}</Text>
      <TextInput
        className="rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-3 text-white"
        placeholder={placeholder}
        placeholderTextColor="#A3ACBF"
        value={value}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
      />
    </View>
  );
}

type OptionGroupProps<T extends string> = {
  label: string;
  options: T[];
  selected: T;
  onSelect: (value: T) => void;
};

function OptionGroup<T extends string>({ label, options, selected, onSelect }: OptionGroupProps<T>) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-[#A3ACBF]">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <Pressable
              key={option}
              className={isSelected ? 'rounded-xl bg-[#0051E8] px-4 py-2' : 'rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-2'}
              onPress={() => onSelect(option)}
            >
              <Text className={isSelected ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-[#A3ACBF]'}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
