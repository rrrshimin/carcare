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
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string | null;
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
  autoCapitalize,
  autoCorrect,
  error,
}: LabeledTextInputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-[#A3ACBF]">{label}</Text>
      <View
        className={`min-h-12 flex-row items-center rounded-xl border bg-[#141A2B] ${
          error ? 'border-red-500' : 'border-[#1F2740]'
        }`}
      >
        <TextInput
          className="flex-1 px-4 py-3 text-white"
          placeholder={placeholder ?? label}
          placeholderTextColor="#A3ACBF"
          value={value}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          selectionColor="#367DFF"
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        {rightElement ?? null}
      </View>
      {error ? (
        <Text className="text-[13px] text-red-400">{error}</Text>
      ) : null}
    </View>
  );
}
