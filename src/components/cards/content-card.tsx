import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

type ContentCardProps = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function ContentCard({ children, className, style }: ContentCardProps) {
  return (
    <View style={style} className={`rounded-2xl bg-[#141A2B] p-4 ${className ?? ''}`}>
      {children}
    </View>
  );
}
