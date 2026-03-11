import { Text, View } from 'react-native';

type ScreenTitleBlockProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function ScreenTitleBlock({ title, subtitle, className }: ScreenTitleBlockProps) {
  return (
    <View className={`gap-1 ${className ?? ''}`}>
      <Text className="text-3xl font-extrabold text-white">{title}</Text>
      {subtitle ? <Text className="mt-2 text-sm leading-5 text-[#A3ACBF]">{subtitle}</Text> : null}
      <View className="mt-2 h-px w-14 bg-[#1F2740]" />
    </View>
  );
}
