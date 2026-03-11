import { Text, TextInput, View } from 'react-native';

type LabeledMultilineInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

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
