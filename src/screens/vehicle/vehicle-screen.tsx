import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { MaintenanceCategoryCard } from '@/components/cards/maintenance-category-card';
import { MileageCard } from '@/components/cards/mileage-card';
import { VehicleHeroCard } from '@/components/cards/vehicle-hero-card';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { BottomSheet, BottomSheetOption } from '@/components/feedback/bottom-sheet';
import { SignInGateModal } from '@/components/feedback/sign-in-gate-modal';
import { BackArrowIcon } from '@/components/icons/app-icons';
import { useAuth } from '@/context/auth-context';
import { getMaintenanceSummary } from '@/features/maintenance/get-maintenance-summary';
import { useVehicleData } from '@/hooks/use-vehicle-data';
import { useNotifications } from '@/hooks/use-notifications';
import { routes } from '@/navigation/routes';
import { deleteVehicle } from '@/services/vehicle-service';
import { getPendingTransfer, cancelTransfer } from '@/services/transfer-service';
import type { PendingVehicleTransfer } from '@/types/transfer';
import type { CategoryDisplay, ItemDisplay } from '@/types/maintenance';
import type { AppStackParamList } from '@/types/navigation';
import type { DistanceUnit, FuelType, Transmission, Vehicle } from '@/types/vehicle';
import type { VehicleRow } from '@/services/api/vehicle-api';
import type { UserDeviceRow } from '@/services/api/device-api';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.vehicle>;

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

export function VehicleScreen({ navigation }: Props) {
  const { data, loading, error } = useVehicleData();
  const { isGuest, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [gateVisible, setGateVisible] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<PendingVehicleTransfer | null>(null);
  useNotifications(data);

  const isActive = data?.vehicle?.is_active !== false;
  const isLocked = !!pendingTransfer;

  useFocusEffect(
    useCallback(() => {
      if (!data?.vehicle || !isAuthenticated) return;
      let cancelled = false;
      getPendingTransfer(data.vehicle.id)
        .then((pt) => { if (!cancelled) setPendingTransfer(pt); })
        .catch(() => {});
      return () => { cancelled = true; };
    }, [data?.vehicle?.id, isAuthenticated]),
  );

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

  function handleEditVehicle() {
    if (!data) return;
    setSheetVisible(false);
    navigation.navigate(routes.editVehicle, { vehicleId: data.vehicle.id });
  }

  function handleTransferVehicle() {
    if (!data) return;
    setSheetVisible(false);
    if (isGuest) {
      setGateVisible(true);
      return;
    }
    navigation.navigate(routes.transfer, { vehicleId: data.vehicle.id });
  }

  async function handleCancelTransfer() {
    if (!pendingTransfer) return;
    setSheetVisible(false);
    Alert.alert(
      'Cancel Transfer',
      'Are you sure you want to cancel this transfer request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelTransfer(pendingTransfer.requestId);
              setPendingTransfer(null);
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Could not cancel transfer.');
            }
          },
        },
      ],
    );
  }

  function handleDeleteVehicle() {
    if (!data) return;
    setSheetVisible(false);
    const name = data.vehicle.name ?? 'this vehicle';
    confirmDeleteVehicle(name);
  }

  function confirmDeleteVehicle(name: string) {
    if (!data) return;

    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete "${name}"? This will permanently remove the vehicle and all its maintenance logs. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => performDeleteVehicle(data.vehicle.id),
        },
      ],
    );
  }

  async function performDeleteVehicle(vehicleId: number) {
    setDeleting(true);
    try {
      const remaining = await deleteVehicle(vehicleId);

      if (remaining >= 2) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: routes.appFlow,
                state: { routes: [{ name: routes.garage }] },
              },
            ],
          }),
        );
      } else if (remaining === 1) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: routes.appFlow }],
          }),
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: routes.setupFlow,
                state: { routes: [{ name: routes.addVehicle }] },
              },
            ],
          }),
        );
      }
    } catch (e) {
      Alert.alert(
        'Delete Failed',
        e instanceof Error ? e.message : 'Could not delete the vehicle.',
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(routes.garage);
    }
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

  return (
    <View className="flex-1 bg-[#0C111F]">
      <SignInGateModal
        visible={gateVisible}
        onSignIn={() => {
          setGateVisible(false);
          navigation.navigate(routes.auth);
        }}
        onCancel={() => setGateVisible(false)}
      />

      {/* Back button (top-left) */}
      <Pressable
        onPress={handleBack}
        className="absolute z-10 rounded-full bg-black/40 p-2"
        style={{ top: insets.top + 8, left: 16 }}
        hitSlop={8}
      >
        <BackArrowIcon size={24} />
      </Pressable>

      {/* Vehicle options bottom sheet */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title={vehicle.name}
      >
        {isLocked ? (
          <>
            <BottomSheetOption label="Cancel Transfer" onPress={handleCancelTransfer} destructive />
          </>
        ) : !isActive ? (
          <>
            <BottomSheetOption label="Delete" onPress={handleDeleteVehicle} destructive />
          </>
        ) : (
          <>
            <BottomSheetOption label="Edit Vehicle" onPress={handleEditVehicle} />
            <BottomSheetOption label="Transfer Vehicle" onPress={handleTransferVehicle} />
            <BottomSheetOption label="Delete" onPress={handleDeleteVehicle} destructive />
          </>
        )}
      </BottomSheet>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <VehicleHeroCard
          vehicle={vehicle}
          onPressShare={isLocked || !isActive ? undefined : () => navigation.navigate(routes.shareLink)}
          onPressOptions={() => setSheetVisible(true)}
        />

        <View style={{ paddingHorizontal: 16, gap: 13, marginTop: 13 }}>
          {isLocked && pendingTransfer ? (
            <View className="rounded-2xl bg-[#1A2240] p-4">
              <Text
                className="text-sm text-[#FF8126]"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Transfer pending
              </Text>
              <Text
                className="mt-1 text-xs text-[#A3ACBF]"
                style={{ fontFamily: 'Poppins' }}
              >
                Waiting for @{pendingTransfer.recipientUsername} to respond. Editing, logging, sharing, and deleting are blocked until the request is resolved.
              </Text>
            </View>
          ) : null}

          {!isActive ? (
            <View className="rounded-2xl bg-[#1A2240] p-4">
              <Text
                className="text-sm text-[#A3ACBF]"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Inactive vehicle
              </Text>
              <Text
                className="mt-1 text-xs text-[#6B7490]"
                style={{ fontFamily: 'Poppins' }}
              >
                Your plan does not support another active vehicle. Upgrade your plan to unlock full functionality.
              </Text>
            </View>
          ) : null}

          {isActive && !isLocked ? (
            <MileageCard
              currentOdometer={vehicle.currentOdometer}
              unit={vehicle.unit}
              onPressUpdate={() => navigation.navigate(routes.updateMileage)}
            />
          ) : (
            <MileageCard
              currentOdometer={vehicle.currentOdometer}
              unit={vehicle.unit}
            />
          )}

          {filteredSummary.map((group) => (
            <MaintenanceCategoryCard
              key={group.id}
              category={group}
              items={group.items}
              onPressNewLog={isActive && !isLocked ? handlePressNewLog : undefined}
              onPressItem={handlePressItem}
              onPressAddLog={isActive && !isLocked ? handlePressAddLog : undefined}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
