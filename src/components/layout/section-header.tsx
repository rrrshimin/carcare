import { Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View>
      <Text className="text-lg font-bold text-white">{title}</Text>
      {subtitle ? <Text className="mt-1 text-sm text-[#A3ACBF]">{subtitle}</Text> : null}
    </View>
  );
}
