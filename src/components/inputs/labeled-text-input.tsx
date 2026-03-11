import { Text, TextInput, View } from 'react-native';

type LabeledTextInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
};

export function LabeledTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: LabeledTextInputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-[#A3ACBF]">{label}</Text>
      <TextInput
        className="min-h-11 rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-3 text-white"
        placeholder={placeholder ?? label}
        placeholderTextColor="#A3ACBF"
        value={value}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        selectionColor="#367DFF"
      />
    </View>
  );
}
