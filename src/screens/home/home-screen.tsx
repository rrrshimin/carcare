import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { MaintenanceCategoryCard } from '@/components/cards/maintenance-category-card';
import { MileageCard } from '@/components/cards/mileage-card';
import { VehicleHeroCard } from '@/components/cards/vehicle-hero-card';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { getMaintenanceSummary } from '@/features/maintenance/get-maintenance-summary';
import { useHomeData } from '@/hooks/use-home-data';
import { useNotifications } from '@/hooks/use-notifications';
import { routes } from '@/navigation/routes';
import type { CategoryDisplay, ItemDisplay } from '@/types/maintenance';
import type { AppStackParamList } from '@/types/navigation';
import type { DistanceUnit, FuelType, Transmission, Vehicle } from '@/types/vehicle';
import type { VehicleRow } from '@/services/api/vehicle-api';
import type { UserDeviceRow } from '@/services/api/device-api';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.home>;

// ── Helpers ─────────────────────────────────────────────────────────

function mapVehicle(row: VehicleRow, device: UserDeviceRow): Vehicle {
  return {
    id: String(row.id),
    name: row.name ?? '',
    year: row.year ?? 0,
    fuelType: (row.fuel_type as FuelType) ?? 'petrol',
    transmission: (row.transmission as Transmission) ?? 'manual',
    currentOdometer: row.current_odometer ?? 0,
    unit: (device.unit as DistanceUnit) ?? 'km',
    imageUri: row.image_url ?? undefined,
    createdAt: row.created_at,
  };
}

// ── Screen ──────────────────────────────────────────────────────────

export function HomeScreen({ navigation }: Props) {
  const { data, loading, error } = useHomeData();
  useNotifications(data);

  const vehicle = useMemo(() => {
    if (!data) return null;
    return mapVehicle(data.vehicle, data.device);
  }, [data]);

  const summary = useMemo(() => {
    if (!data) return [];
    return getMaintenanceSummary(data);
  }, [data]);

  const filteredSummary = useMemo(() => {
    return summary.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.status.variant !== 'neutral'),
    }));
  }, [summary]);

  // ── Navigation handlers ─────────────────────────────────────────

  function handlePressNewLog(category: CategoryDisplay) {
    navigation.navigate(routes.selectLogType, {
      categoryId: category.id,
      categoryName: category.name,
    });
  }

  function handlePressItem(item: ItemDisplay) {
    navigation.navigate(routes.maintenanceHistory, {
      logTypeId: item.id,
      logTypeName: item.name,
    });
  }

  function handlePressAddLog(item: ItemDisplay) {
    navigation.navigate(routes.addLog, {
      logTypeId: item.id,
      logTypeName: item.name,
    });
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0C111F] px-6">
        <Text className="text-lg font-semibold text-white">No vehicle found</Text>
        <Text className="mt-2 text-center text-sm text-[#A3ACBF]">
          Add a vehicle to start tracking maintenance.
        </Text>
        <View className="mt-6 w-full">
          <PrimaryButton
            label="Add Vehicle"
            onPress={() =>
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: routes.setupFlow }],
                }),
              )
            }
          />
        </View>
      </View>
    );
  }

  // ── Main content ────────────────────────────────────────────────

  return (
    <ScrollView
      className="flex-1 bg-[#0C111F]"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <VehicleHeroCard
        vehicle={vehicle}
        onPressShare={() => navigation.navigate(routes.shareLink)}
        onPressUpdateMileage={() => navigation.navigate(routes.updateMileage)}
      />

      <View style={{ paddingHorizontal: 16, gap: 16, marginTop: 16 }}>
        <MileageCard
          currentOdometer={vehicle.currentOdometer}
          unit={vehicle.unit}
          onPressUpdate={() => navigation.navigate(routes.updateMileage)}
        />

        {filteredSummary.map((group) => (
          <MaintenanceCategoryCard
            key={group.id}
            category={group}
            items={group.items}
            onPressNewLog={handlePressNewLog}
            onPressItem={handlePressItem}
            onPressAddLog={handlePressAddLog}
          />
        ))}
      </View>
    </ScrollView>
  );
}
