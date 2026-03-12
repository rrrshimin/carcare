import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type ContentCardProps = {
  children: ReactNode;
  className?: string;
};

export function ContentCard({ children, className }: ContentCardProps) {
  return (
    <View style={styles.card} className={`rounded-2xl bg-[#141A2B] p-4 ${className ?? ''}`}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
   
  },
});
