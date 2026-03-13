import { ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';

type LabeledTextInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
  maxLength?: number;
  rightElement?: ReactNode;
};

// ── Labeled single-line text input ───────────────────────────────────
// Reused on: Add Vehicle (name, year, odometer), Add Log (mileage, spec), Update Mileage.
// Changing styles here affects every form in the app.
export function LabeledTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  maxLength,
  rightElement,
}: LabeledTextInputProps) {
  return (
    // gap-2 (8px) between label and field
    <View className="gap-2">
      {/* Field label: 14px secondary gray */}
      <Text className="text-sm text-[#A3ACBF]">{label}</Text>
      {/* Input container: min-h-11 (44px), card fill #141A2B, border #1F2740, rounded-xl (12px) */}
      <View className="min-h-11 flex-row items-center rounded-xl border border-[#1F2740] bg-[#141A2B]">
        <TextInput
          className="flex-1 px-4 py-3 text-white"
          placeholder={placeholder ?? label}
          placeholderTextColor="#A3ACBF"
          value={value}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          selectionColor="#367DFF"
          maxLength={maxLength}
        />
        {/* rightElement slot: used for unit toggle (km/mi) on odometer input */}
        {rightElement ?? null}
      </View>
    </View>
  );
}
