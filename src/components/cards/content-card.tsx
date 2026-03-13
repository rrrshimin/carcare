import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

type ContentCardProps = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

// ── Base card wrapper ────────────────────────────────────────────────
// Foundation for almost every card in the app (vehicle hero info, mileage, categories,
// history rows, share link, empty states in lists).
// Radius: rounded-2xl (16px). Fill: #141A2B. Padding: p-4 (16px).
// Changing these values will affect the look of every card throughout the app.
export function ContentCard({ children, className, style }: ContentCardProps) {
  return (
    <View style={style} className={`rounded-2xl bg-[#141A2B] p-4 ${className ?? ''}`}>
      {children}
    </View>
  );
}
