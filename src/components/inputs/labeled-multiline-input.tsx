import { Text, TextInput, View } from 'react-native';

type LabeledMultilineInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

// ── Multiline text input ─────────────────────────────────────────────
// Used for "Notes" field on Add Log screen.
// min-h-24 (96px) gives initial height. textAlignVertical="top" pins cursor to top-left.
// Shares same fill/border/radius as LabeledTextInput for consistency.
export function LabeledMultilineInput({
  label,
  value,
  onChangeText,
  placeholder,
}: LabeledMultilineInputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-[#A3ACBF]">{label}</Text>
      <TextInput
        className="min-h-24 rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-3 text-white"
        placeholder={placeholder ?? label}
        placeholderTextColor="#A3ACBF"
        multiline
        value={value}
        onChangeText={onChangeText}
        selectionColor="#367DFF"
        textAlignVertical="top"
      />
    </View>
  );
}
