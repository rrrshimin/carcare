import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ContentCard } from '@/components/cards/content-card';
import { LogTypeRow } from '@/components/lists/log-type-row';
import { routes } from '@/navigation/routes';
import {
  getLogTypesByCategoryId,
  type LogTypeRow as LogTypeRecord,
} from '@/services/api/log-type-api';
import { AppStackParamList } from '@/types/navigation';
import { isLogTypeApplicableToVehicle } from '@/utils/log-type-filter';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.selectLogType>;

export function SelectLogTypeScreen({ navigation, route }: Props) {
  const { categoryId, categoryName, vehicleFuelType, vehicleTransmission } = route.params;
  const [logTypes, setLogTypes] = useState<LogTypeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);

      getLogTypesByCategoryId(categoryId)
        .then((data) => {
          if (!cancelled) {
            const filtered = data.filter((lt) =>
              isLogTypeApplicableToVehicle(lt, vehicleFuelType ?? null, vehicleTransmission ?? null),
            );
            setLogTypes(filtered);
          }
        })
        .catch((e) => {
          if (!cancelled) {
            setError(
              e instanceof Error ? e.message : 'Failed to load log types',
            );
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [categoryId, vehicleFuelType, vehicleTransmission]),
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0C111F]">
        <ActivityIndicator size="large" color="#0051E8" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0C111F] px-6">
        <Text className="text-lg font-semibold text-white">Something went wrong</Text>
        <Text className="mt-2 text-center text-sm text-[#A3ACBF]">{error}</Text>
      </View>
    );
  }

  // ── Select Log Type layout ───────────────────────────────────────────
  // ScrollView with 16px padding all around, 12px gap between rows.
  // Category name label at top: 14px secondary gray.
  // Each LogTypeRow is a card-styled pressable row.
  // Empty state: single ContentCard with gray message.
  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text className="text-sm text-[#A3ACBF]">{categoryName}</Text>

      {logTypes.map((lt) => (
        <LogTypeRow
          key={lt.id}
          title={lt.log_type_name ?? 'Unknown'}
          subtitle="Open Add Log form"
          onPress={() =>
            navigation.navigate(routes.addLog, {
              logTypeId: lt.id,
              logTypeName: lt.log_type_name ?? 'Unknown',
            })
          }
        />
      ))}

      {!logTypes.length ? (
        <ContentCard className="rounded-xl">
          <Text className="text-sm text-[#A3ACBF]">
            No log types available for this category yet.
          </Text>
        </ContentCard>
      ) : null}
    </ScrollView>
  );
}
