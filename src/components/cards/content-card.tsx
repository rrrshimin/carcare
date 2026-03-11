import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type ContentCardProps = {
  children: ReactNode;
  className?: string;
};

export function ContentCard({ children, className }: ContentCardProps) {
  return (
    <View style={styles.card} className={`rounded-2xl border border-[#1F2740] bg-[#141A2B] p-4 ${className ?? ''}`}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
});
