import { ScrollView, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ContentCard } from '@/components/cards/content-card';
import { StatusBadge } from '@/components/feedback/status-badge';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { HistoryLogRow } from '@/components/lists/history-log-row';
import { routes } from '@/navigation/routes';
import { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.maintenanceHistory>;

const placeholderHistory = [
  { id: 'log-1', spec: '5W-30', mileage: '141,200', date: '18 Dec 2024', notes: 'Changed at dealership' },
  { id: 'log-2', spec: '5W-30', mileage: '132,000', date: '05 Jul 2024', notes: 'Standard maintenance' },
];

export function MaintenanceHistoryScreen({ route }: Props) {
  const { logTypeName } = route.params ?? {};

  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <ScreenTitleBlock title="Maintenance History" />
      <ContentCard className="rounded-xl">
        <Text className="text-base font-semibold text-white">{logTypeName ?? 'Maintenance Item'}</Text>
        <StatusBadge label="Service status pending" />
      </ContentCard>

      {placeholderHistory.map((entry) => (
        <HistoryLogRow
          key={entry.id}
          specification={entry.spec}
          mileage={entry.mileage}
          date={entry.date}
          notes={entry.notes}
        />
      ))}
    </ScrollView>
  );
}
