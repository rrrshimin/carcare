import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { DateInputField } from '@/components/inputs/date-input-field';
import { LabeledMultilineInput } from '@/components/inputs/labeled-multiline-input';
import { LabeledTextInput } from '@/components/inputs/labeled-text-input';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { routes } from '@/navigation/routes';
import { getLogTypeById, type LogTypeRow } from '@/services/api/log-type-api';
import { getCurrentVehicle } from '@/services/vehicle-service';
import { addMaintenanceLog } from '@/features/maintenance/add-maintenance-log';
import {
  validateLogInput,
  type CreateLogInput,
  type CreateLogValidationError,
} from '@/services/log-service';
import { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.addLog>;

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function AddLogScreen({ navigation, route }: Props) {
  const { logTypeId, logTypeName } = route.params;

  // ── Loading the log type for dynamic spec fields ───────────────
  const [logType, setLogType] = useState<LogTypeRow | null>(null);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [currentOdometer, setCurrentOdometer] = useState<number>(0);
  const [fuelType, setFuelType] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function init() {
        try {
          setInitLoading(true);
          setInitError(null);

          const [lt, vehicle] = await Promise.all([
            getLogTypeById(logTypeId),
            getCurrentVehicle(),
          ]);

          if (cancelled) return;

          if (!lt) {
            setInitError('Log type not found.');
            return;
          }
          setLogType(lt);

          if (!vehicle) {
            setInitError('No vehicle found. Please add a vehicle first.');
            return;
          }
          setVehicleId(vehicle.id);
          setCurrentOdometer(vehicle.current_odometer ?? 0);
          setFuelType(vehicle.fuel_type);
        } catch (e) {
          if (!cancelled) {
            setInitError(
              e instanceof Error ? e.message : 'Failed to load log type data',
            );
          }
        } finally {
          if (!cancelled) setInitLoading(false);
        }
      }

      init();
      return () => { cancelled = true; };
    }, [logTypeId]),
  );

  // ── Form state ─────────────────────────────────────────────────
  const [mileage, setMileage] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [specification, setSpecification] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<CreateLogValidationError | null>(null);

  // ── Derived spec label / placeholder from log type ─────────────
  const specLabel = logType?.spec_name || 'Specification';
  const specPlaceholder = logType?.spec_placeholder || '';
  const isMileageBased = logType?.due_type !== 'time';

  // ── Save handler ───────────────────────────────────────────────
  async function handleSave() {
    if (vehicleId === null) return;

    const input: CreateLogInput = {
      carId: vehicleId,
      logTypeId,
      odoLog: mileage.trim() ? Number(mileage.trim()) : null,
      changeDate: date ? toISODate(date) : '',
      specs: specification,
      notes,
    };

    const error = validateLogInput(input, {
      mileageRequired: isMileageBased,
      currentOdometer,
    });
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);

    try {
      setSaving(true);
      await addMaintenanceLog(input, logType!, fuelType);
      navigation.goBack();
    } catch (e) {
      Alert.alert(
        'Save Failed',
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
  if (initError) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0C111F] px-6">
        <Text className="text-lg font-semibold text-white">Something went wrong</Text>
        <Text className="mt-2 text-center text-sm text-[#A3ACBF]">{initError}</Text>
      </View>
    );
  }

  // ── Form ───────────────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 bg-[#0C111F]"
      contentContainerStyle={{ padding: 16, gap: 12 }}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenTitleBlock title="Add Log" subtitle={logTypeName} />

      <LabeledTextInput
        label={`Changed At (${isMileageBased ? 'km/mi' : 'odometer'})`}
        value={mileage}
        onChangeText={(text) => {
          setMileage(text);
          if (validationError?.field === 'mileage') setValidationError(null);
        }}
        keyboardType="number-pad"
        placeholder="e.g. 45000"
      />
      {validationError?.field === 'mileage' ? (
        <Text className="-mt-1 text-xs text-red-400">{validationError.message}</Text>
      ) : null}

      <DateInputField
        label="Date"
        value={date}
        onChange={(d) => {
          setDate(d);
          if (validationError?.field === 'date') setValidationError(null);
        }}
        error={validationError?.field === 'date' ? validationError.message : null}
      />

      <LabeledTextInput
        label={specLabel}
        value={specification}
        onChangeText={setSpecification}
        placeholder={specPlaceholder || specLabel}
      />

      <LabeledMultilineInput
        label="Notes"
        placeholder="Optional notes"
        value={notes}
        onChangeText={setNotes}
      />

      {validationError?.field === 'general' ? (
        <Text className="text-sm text-red-400">{validationError.message}</Text>
      ) : null}

      <PrimaryButton
        label={saving ? 'Saving…' : 'Save'}
        onPress={handleSave}
        disabled={saving}
      />
    </ScrollView>
  );
}
