import { ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ContentCard } from '@/components/cards/content-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { HistoryLogRow } from '@/components/lists/history-log-row';
import { useMaintenanceHistory } from '@/hooks/use-maintenance-history';
import { routes } from '@/navigation/routes';
import { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.maintenanceHistory>;

export function MaintenanceHistoryScreen({ route }: Props) {
  const { logTypeId, logTypeName } = route.params;
  const { data, loading, error } = useMaintenanceHistory(logTypeId);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <EmptyState title="No data available" />;

  const displayName = data.logTypeName !== 'Unknown' ? data.logTypeName : logTypeName;

  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <ContentCard>
        <Text className="text-base font-semibold text-white">{displayName}</Text>
        <View className="mt-2">
          <StatusBadge label={data.dueStatus.label} variant={data.dueStatus.variant} />
        </View>
      </ContentCard>

      {data.entries.length === 0 ? (
        <ContentCard>
          <Text className="text-center text-sm text-[#A3ACBF]">
            No logs yet for {displayName}.
          </Text>
          <Text className="mt-1 text-center text-xs text-[#A3ACBF]">
            Add your first maintenance log from the home screen.
          </Text>
        </ContentCard>
      ) : (
        data.entries.map((entry) => (
          <HistoryLogRow
            key={entry.id}
            specLabel={data.specLabel}
            specification={entry.specification}
            mileage={entry.mileage}
            date={entry.date}
            notes={entry.notes}
            unit={data.unit}
          />
        ))
      )}
    </ScrollView>
  );
}
