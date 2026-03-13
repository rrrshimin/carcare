import { Pressable, Text, View } from 'react-native';

type OptionPillGroupProps<T extends string> = {
  label?: string;
  options: T[];
  selected: T;
  onSelect: (value: T) => void;
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function OptionPillGroup<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: OptionPillGroupProps<T>) {
  return (
    <View className="gap-2">
      {label ? <Text className="text-sm text-[#A3ACBF]">{label}</Text> : null}
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <Pressable
              key={option}
              className={
                isSelected
                  ? 'min-h-10 justify-center rounded-xl bg-[#0051E8] px-4 py-2'
                  : 'min-h-10 justify-center rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-2'
              }
              onPress={() => onSelect(option)}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : undefined })}
            >
              <Text className={isSelected ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-[#A3ACBF]'}>
                {capitalize(option)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
