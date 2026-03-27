import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { ReminderOptInSheet } from '@/components/feedback/reminder-opt-in-sheet';
import { BackArrowIcon } from '@/components/icons/app-icons';
import { LabeledTextInput } from '@/components/inputs/labeled-text-input';
import { OptionPillGroup } from '@/components/inputs/option-pill-group';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { useAuth } from '@/context/auth-context';
import { scheduleMileageReminder } from '@/features/notifications/schedule-mileage-reminder';
import { routes } from '@/navigation/routes';
import { getDeviceByDeviceId } from '@/services/api/device-api';
import { requestNotificationPermission } from '@/services/notification-service';
import { getDeviceId, getLastMileageUpdate } from '@/services/storage-service';
import { createVehicle, getAllVehicles } from '@/services/vehicle-service';
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

export function AddVehicleScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { isGuest } = useAuth();
  const isAddAnother = route.params?.mode === 'add-another';
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
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'name' | 'year' | 'odometer', string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [optInVisible, setOptInVisible] = useState(false);
  const [createdVehicle, setCreatedVehicle] = useState<{ id: number; name: string | null } | null>(null);

  useEffect(() => {
    if (!isAddAnother) return;
    let cancelled = false;
    (async () => {
      const deviceId = await getDeviceId();
      if (!deviceId || cancelled) return;
      const device = await getDeviceByDeviceId(deviceId);
      if (cancelled) return;
      const storedUnit = (device?.unit as DistanceUnit) ?? 'km';
      setForm((prev) => ({ ...prev, unit: storedUnit }));
    })();
    return () => { cancelled = true; };
  }, [isAddAnother]);

  function handleBack() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: routes.appFlow,
            state: { routes: [{ name: routes.garage }] },
          },
        ],
      }),
    );
  }

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const odometerDisplay = form.odometer ? formatWithCommas(form.odometer) : '';

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'name' || key === 'year' || key === 'odometer') {
      setFieldErrors((prev) => {
        if (!prev[key as 'name' | 'year' | 'odometer']) return prev;
        const next = { ...prev };
        delete next[key as 'name' | 'year' | 'odometer'];
        return next;
      });
    }
  }

  function handleYearChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    updateForm('year', digits);
  }

  function handleOdometerChange(text: string) {
    const digits = text.replace(/\D/g, '');
    updateForm('odometer', digits);
  }

  function validate(): boolean {
    const errors: Partial<Record<'name' | 'year' | 'odometer', string>> = {};

    if (!form.name.trim()) {
      errors.name = 'Vehicle name is required.';
    }

    if (!form.year || form.year.length !== 4) {
      errors.year = 'Year must be exactly 4 digits.';
    } else {
      const parsedYear = Number(form.year);
      if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > currentYear) {
        errors.year = `Year must be between 1900 and ${currentYear}.`;
      }
    }

    const parsedOdometer = Number(form.odometer);
    if (form.odometer === '' || !Number.isFinite(parsedOdometer)) {
      errors.odometer = 'Odometer is required.';
    } else if (!Number.isInteger(parsedOdometer) || parsedOdometer < 0) {
      errors.odometer = 'Odometer must be a non-negative whole number.';
    } else if (parsedOdometer > 1_000_000) {
      errors.odometer = 'Odometer cannot exceed 1,000,000.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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

  function navigateToApp(isMultiCar: boolean) {
    if (isMultiCar) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: routes.appFlow,
              state: { routes: [{ name: routes.garage }] },
            },
          ],
        }),
      );
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routes.appFlow }],
        }),
      );
    }
  }

  async function handleOptInEnable() {
    const granted = await requestNotificationPermission();

    if (granted && createdVehicle) {
      const lastUpdate = await getLastMileageUpdate(createdVehicle.id);
      if (lastUpdate) {
        await scheduleMileageReminder(
          lastUpdate,
          createdVehicle.id,
          createdVehicle.name ?? undefined,
        );
      }
      setOptInVisible(false);
      navigateToApp(false);
      return;
    }

    // OS refused to show the dialog (previously denied / stale state).
    // Guide the user to device settings instead.
    setOptInVisible(false);
    Alert.alert(
      'Enable in Settings',
      'Android blocked the permission request. Please enable notifications manually in your device settings.',
      [
        { text: 'Skip', style: 'cancel', onPress: () => navigateToApp(false) },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings();
            navigateToApp(false);
          },
        },
      ],
    );
  }

  function handleOptInSkip() {
    setOptInVisible(false);
    navigateToApp(false);
  }

  async function handleSubmit() {
    if (!validate()) return;

    setError(null);
    setSubmitting(true);
    try {
      const vehicle = await createVehicle({
        imageUri: form.imageUri,
        name: form.name,
        year: Number(form.year),
        fuelType: form.fuelType,
        transmission: form.transmission,
        currentOdometer: Number(form.odometer),
        unit: form.unit,
      });

      const vehicles = await getAllVehicles();

      if (vehicles.length >= 2) {
        // Additional car — permission already decided, schedule directly
        const lastUpdate = await getLastMileageUpdate(vehicle.id);
        if (lastUpdate) {
          scheduleMileageReminder(lastUpdate, vehicle.id, vehicle.name ?? undefined).catch(() => {});
        }
        navigateToApp(true);
      } else {
        // First car — show opt-in sheet before navigating
        setCreatedVehicle({ id: vehicle.id, name: vehicle.name });
        setOptInVisible(true);
      }
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
    <View className="mr-2 flex-row items-center gap-2">
      {unitOptions.map((u) => (
        <Pressable
          key={u}
          className={
            form.unit === u
              ? 'min-h-9 items-center justify-center rounded-lg bg-[#0051E8] px-4 py-2'
              : 'min-h-9 items-center justify-center rounded-lg bg-[#0C111F] px-4 py-2'
          }
          onPress={() => updateForm('unit', u)}
          hitSlop={4}
        >
          <Text
            className={
              form.unit === u
                ? 'text-[13px] font-semibold text-white'
                : 'text-[13px] font-semibold text-[#A3ACBF]'
            }
          >
            {u}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0C111F]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: insets.top + (isAddAnother ? 12 : 24),
            paddingHorizontal: 16,
            paddingBottom: 32,
            gap: 12,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {isAddAnother ? (
            <Pressable
              onPress={handleBack}
              className="mb-2 self-start rounded-full bg-black/40 p-2"
              hitSlop={8}
            >
              <BackArrowIcon size={24} />
            </Pressable>
          ) : null}

          <ScreenTitleBlock
            title={isAddAnother ? 'Add New Car' : 'Add Vehicle'}
            subtitle={
              isAddAnother
                ? 'Add another vehicle to your garage.'
                : "Let's add your vehicle to start tracking maintenance."
            }
          />

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
            error={fieldErrors.name}
          />
          <LabeledTextInput
            label="Year"
            placeholder="2020"
            keyboardType="number-pad"
            maxLength={4}
            value={form.year}
            onChangeText={handleYearChange}
            error={fieldErrors.year}
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
            rightElement={isAddAnother ? undefined : unitToggle}
            error={fieldErrors.odometer}
          />

          {error ? <Text className="text-sm text-red-400">{error}</Text> : null}

          <PrimaryButton className="mt-2" disabled={submitting} onPress={handleSubmit} label={submitting ? 'Adding...' : 'Add'} />

          {isGuest && !isAddAnother && (
            <Pressable
              className="mt-4 items-center py-2"
              onPress={() => navigation.navigate(routes.auth)}
            >
              <Text
                className="text-sm text-[#A3ACBF]"
                style={{ fontFamily: 'Poppins' }}
              >
                Already have an account?{' '}
                <Text className="font-semibold text-[#367DFF]">Log in</Text>
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>

      <ReminderOptInSheet
        visible={optInVisible}
        onEnable={handleOptInEnable}
        onSkip={handleOptInSkip}
      />
    </KeyboardAvoidingView>
  );
}
