import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { formatDisplayDate } from '@/utils/formatting/format-date';

type DateInputFieldProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  maximumDate?: Date;
  error?: string | null;
};

// ── Date picker input ────────────────────────────────────────────────
// Used on Add Log screen. Shows a pressable field that opens platform date picker.
// Field styling matches LabeledTextInput for visual consistency.
// Error state: border turns red-500. iOS gets spinner + Done button; Android auto-dismisses.
export function DateInputField({
  label,
  value,
  onChange,
  maximumDate,
  error,
}: DateInputFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  function handleChange(_event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) onChange(selected);
  }

  function handleConfirmIOS() {
    setShowPicker(false);
  }

  return (
    <View className="gap-2">
      <Text className="text-sm text-[#A3ACBF]">{label}</Text>
      {/* Pressable field: same sizing as LabeledTextInput (min-h-11, rounded-xl, card fill).
          Error state swaps border to red-500. */}
      <Pressable
        className={`min-h-12 justify-center rounded-xl border px-4 py-3 ${
          error ? 'border-red-500' : 'border-[#1F2740]'
        } bg-[#141A2B]`}
        onPress={() => setShowPicker(true)}
      >
        <Text className={value ? 'text-white' : 'text-[#A3ACBF]'}>
          {value ? formatDisplayDate(value) : 'Select date'}
        </Text>
      </Pressable>

      {/* Validation error text: 12px red */}
      {error ? (
        <Text className="text-[13px] text-red-400">{error}</Text>
      ) : null}

      {showPicker && (
        <>
          {/* themeVariant="dark" matches the app's dark UI */}
          <DateTimePicker
            value={value ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={maximumDate ?? new Date()}
            onChange={handleChange}
            themeVariant="dark"
          />
          {/* iOS-only "Done" dismiss button styled as brand-blue bar */}
          {Platform.OS === 'ios' && (
            <Pressable
              className="items-center rounded-xl bg-[#0051E8] py-2"
              onPress={handleConfirmIOS}
            >
              <Text className="font-semibold text-white">Done</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}
