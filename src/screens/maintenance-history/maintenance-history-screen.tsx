import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { HistoryLogRow } from '@/components/lists/history-log-row';
import { useAuth } from '@/context/auth-context';
import { type HistoryLogEntry } from '@/features/maintenance/get-maintenance-history';
import { useMaintenanceHistory } from '@/hooks/use-maintenance-history';
import { routes } from '@/navigation/routes';
import { deleteLog } from '@/services/log-service';
import { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.maintenanceHistory>;

export function MaintenanceHistoryScreen({ route }: Props) {
  const { logTypeId, logTypeName } = route.params;
  const { data, loading, error, retry } = useMaintenanceHistory(logTypeId);
  const { session } = useAuth();
  const currentAuthId = session?.user?.id ?? null;

  const [entries, setEntries] = useState<HistoryLogEntry[]>([]);

  useEffect(() => {
    if (data) setEntries(data.entries);
  }, [data]);

  function isOwnLog(entry: HistoryLogEntry): boolean {
    if (!currentAuthId) return true;
    if (!entry.createdByAuthId) return true;
    return entry.createdByAuthId === currentAuthId;
  }

  function handleDeleteLog(logId: number, entry: HistoryLogEntry) {
    if (!data) return;

    if (!isOwnLog(entry)) {
      Alert.alert(
        'Cannot delete',
        'This log was created by a previous owner. You can only delete logs you created.',
      );
      return;
    }

    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this maintenance log? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLog(logId, data.vehicleId);
              setEntries((prev) => prev.filter((e) => e.id !== logId));
            } catch (e) {
              Alert.alert(
                'Delete Failed',
                e instanceof Error ? e.message : 'Could not delete the log.',
              );
            }
          },
        },
      ],
    );
  }

  if (loading && !data) return <LoadingState />;
  if (error && !data) return <ErrorState message={error} onRetry={retry} />;
  if (!data) return <EmptyState title="No data available" />;

  const displayName = data.logTypeName !== 'Unknown' ? data.logTypeName : logTypeName;

  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      {/* Centered header: category icon, item name, status badge */}
      <View className="items-center pb-2 pt-1">
        {data.categoryIconUrl ? (
          <Image
            source={{ uri: data.categoryIconUrl }}
            className="h-16 w-16"
            resizeMode="contain"
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#141A2B]">
            <Text className="text-[13px] font-bold text-[#A3ACBF]">
              {displayName.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}

        <Text className="mt-3 text-lg font-bold text-white">{displayName}</Text>

        <View className="mt-2">
          <StatusBadge label={data.dueStatus.label} variant={data.dueStatus.variant} />
        </View>
      </View>

      {entries.length === 0 ? (
        <View className="items-center rounded-2xl bg-[#141A2B] p-6">
          <Text className="text-center text-sm text-[#A3ACBF]">
            No logs yet for {displayName}.
          </Text>
          <Text className="mt-1 text-center text-[13px] text-[#A3ACBF]">
            Add your first maintenance log from the home screen.
          </Text>
        </View>
      ) : (
        entries.map((entry) => (
          <HistoryLogRow
            key={entry.id}
            specLabel={data.specLabel}
            specification={entry.specification}
            mileage={entry.mileage}
            date={entry.date}
            notes={entry.notes}
            costAmount={entry.costAmount}
            currencySymbol={data.currencySymbol}
            unit={data.unit}
            onDelete={() => handleDeleteLog(entry.id, entry)}
            readOnly={!isOwnLog(entry)}
          />
        ))
      )}
    </ScrollView>
  );
}
