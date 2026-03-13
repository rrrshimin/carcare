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
    <View className="gap-2">
      <Text className="text-sm text-[#A3ACBF]">{label}</Text>
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
        {rightElement ?? null}
      </View>
    </View>
  );
}
