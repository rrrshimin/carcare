import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { LabeledTextInput } from '@/components/inputs/labeled-text-input';
import { routes } from '@/navigation/routes';
import {
  getActiveVehicle,
  getMaxLogMileage,
  validateMileageInput,
  updateMileage,
} from '@/services/vehicle-service';
import type { VehicleRow } from '@/services/api/vehicle-api';
import type { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.updateMileage>;

function formatWithCommas(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function UpdateMileageScreen({ navigation }: Props) {
  const [vehicle, setVehicle] = useState<VehicleRow | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const [maxLogMileage, setMaxLogMileage] = useState(0);
  const [mileage, setMileage] = useState('');
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        try {
          setInitLoading(true);
          setInitError(null);

          const v = await getActiveVehicle();
          if (cancelled) return;

          if (!v) {
            setInitError('No vehicle found. Please add a vehicle first.');
            return;
          }

          setVehicle(v);

          const maxMileage = await getMaxLogMileage(v.id);
          if (!cancelled) setMaxLogMileage(maxMileage);
        } catch (e) {
          if (!cancelled) {
            setInitError(
              e instanceof Error ? e.message : 'Failed to load vehicle data',
            );
          }
        } finally {
          if (!cancelled) setInitLoading(false);
        }
      }

      load();
      return () => { cancelled = true; };
    }, []),
  );

  const currentOdometer = vehicle?.current_odometer ?? 0;

  async function handleSave() {
    if (!vehicle) return;

    const rawMileage = mileage.replace(/,/g, '').trim();
    const error = validateMileageInput(rawMileage, maxLogMileage);
    if (error) {
      setValidationError(error.message);
      return;
    }
    setValidationError(null);

    try {
      setSaving(true);
      await updateMileage(vehicle.id, Number(rawMileage));
      navigation.goBack();
    } catch (e) {
      Alert.alert(
        'Update Failed',
        e instanceof Error ? e.message : 'An unexpected error occurred.',
      );
    } finally {
      setSaving(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────────
  if (initLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0C111F]">
        <ActivityIndicator size="large" color="#0051E8" />
      </View>
    );
  }

  // ── Init error state ───────────────────────────────────────────
  if (initError || !vehicle) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0C111F] px-6">
        <Text className="text-lg font-semibold text-white">Something went wrong</Text>
        <Text className="mt-2 text-center text-sm text-[#A3ACBF]">
          {initError ?? 'Vehicle not found.'}
        </Text>
      </View>
    );
  }

  // ── Update Mileage form layout ──────────────────────────────────────
  // ScrollView: 16px padding, 16px gap. Two sections: current odometer display + new value input.
  // Current odometer card: card fill/border, label 14px gray, value 18px SemiBold white.
  // Validation error: 12px red text below input.
  return (
    <ScrollView
      className="flex-1 bg-[#0C111F]"
      contentContainerStyle={{ padding: 16, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Read-only current odometer display card */}
      <View className="rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-3">
        <Text className="text-sm text-[#A3ACBF]">Current odometer</Text>
        <Text className="mt-1 text-lg font-semibold text-white">
          {currentOdometer.toLocaleString()}
        </Text>
      </View>

      <LabeledTextInput
        label="New Mileage Value"
        placeholder="Enter new mileage"
        keyboardType="number-pad"
        value={mileage ? formatWithCommas(mileage) : ''}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '');
          setMileage(digits);
          if (validationError) setValidationError(null);
        }}
        error={validationError}
      />

      <PrimaryButton
        label={saving ? 'Updating…' : 'Update'}
        onPress={handleSave}
        disabled={saving}
      />
    </ScrollView>
  );
}
