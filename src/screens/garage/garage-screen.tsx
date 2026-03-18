import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { TransferRequestCard } from '@/components/cards/transfer-request-card';
import { SignInGateModal } from '@/components/feedback/sign-in-gate-modal';
import { LoadingState } from '@/components/feedback/loading-state';
import { ErrorState } from '@/components/feedback/error-state';
import { AccountIcon, ChevronRightIcon, DangerIcon, SubscriptionStarIcon } from '@/components/icons/app-icons';
import { useAuth } from '@/context/auth-context';
import { useEntitlement, loadEntitlement } from '@/hooks/use-entitlement';
import { useTransferRequests } from '@/hooks/use-transfer-requests';
import { getVehicleDangerCount } from '@/features/maintenance/get-vehicle-danger-count';
import { routes } from '@/navigation/routes';
import { canAddVehicle } from '@/services/entitlement-service';
import { acceptTransfer, declineTransfer } from '@/services/transfer-service';
import type { VehicleRow } from '@/services/api/vehicle-api';
import type { LogTypeRow } from '@/services/api/log-type-api';
import type { UserLogRow } from '@/services/api/user-log-api';
import { getAllLogTypes } from '@/services/api/log-type-api';
import { getLogsByVehicleId } from '@/services/api/user-log-api';
import { getDeviceByDeviceId } from '@/services/api/device-api';
import { getAllVehicles } from '@/services/vehicle-service';
import { getDeviceId } from '@/services/storage-service';
import { getEntitlementStore } from '@/store/entitlement-store';
import { setActiveVehicleId, setVehicleCount } from '@/store/vehicle-store';
import type { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.garage>;

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type VehicleWithDanger = {
  vehicle: VehicleRow;
  dangerCount: number;
};

// ── Upgrade card for non-subscribers ─────────────────────────────────

function ExpandGarageCard({ onPress }: { onPress: () => void }) {
  return (
    <View className="rounded-2xl bg-[#141A2B] p-5">
      <View className="flex-row items-center gap-4">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#1A2240]">
          <SubscriptionStarIcon size={24} />
        </View>
        <View className="flex-1">
          <Text
            className="text-base text-white"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            Expand Your Garage
          </Text>
          <Text
            className="mt-1 text-xs text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
            numberOfLines={2}
          >
            Free plan includes 1 vehicle. Upgrade to add more cars and unlock more features.
          </Text>
        </View>
      </View>
      <View className="mt-4">
        <PrimaryButton label="View Plans" onPress={onPress} />
      </View>
    </View>
  );
}

// ── Vehicle card ─────────────────────────────────────────────────────

function VehicleCard({
  vehicle,
  dangerCount,
  onPress,
}: {
  vehicle: VehicleRow;
  dangerCount: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <View className="overflow-hidden rounded-2xl bg-[#141A2B]">
        {/* Image area */}
        {vehicle.image_url ? (
          <Image
            source={{ uri: vehicle.image_url }}
            className="h-60 w-full bg-[#1A2240]"
            resizeMode="cover"
          />
        ) : (
          <View className="h-60 w-full items-center justify-center bg-[#1A2240]">
            <Text className="text-4xl opacity-30">{'\uD83D\uDE97'}</Text>
          </View>
        )}

        {/* Info area */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-1">
            <Text
              className="text-base text-white"
              style={{ fontFamily: 'Poppins-Bold' }}
              numberOfLines={1}
            >
              {vehicle.name}
              {vehicle.year ? `, ${vehicle.year}` : ''}
            </Text>
            <Text
              className="mt-1.5 text-xs text-[#A3ACBF]"
              style={{ fontFamily: 'Poppins' }}
              numberOfLines={1}
            >
              {(vehicle.current_odometer ?? 0).toLocaleString()} km
              {' \u2022 '}
              {capitalize(vehicle.fuel_type ?? 'petrol')}
              {' \u2022 '}
              {capitalize(vehicle.transmission ?? 'manual')}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            {vehicle.is_active === false ? (
              <View className="rounded-full bg-[#1A2240] px-2.5 py-1">
                <Text
                  className="text-xs text-[#6B7490]"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Inactive
                </Text>
              </View>
            ) : dangerCount > 0 ? (
              <View className="flex-row items-center gap-1 rounded-full bg-[#FF8126]/15 px-2.5 py-1">
                <DangerIcon size={14} />
                <Text
                  className="text-xs text-[#FF8126]"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  {dangerCount}
                </Text>
              </View>
            ) : null}
            <ChevronRightIcon size={20} color="#A3ACBF" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ── Screen ───────────────────────────────────────────────────────────

export function GarageScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isGuest, isAuthenticated } = useAuth();
  const { plan } = useEntitlement();
  const { requests: transferRequests, refresh: refreshTransfers } = useTransferRequests(isAuthenticated);
  const [vehiclesWithDanger, setVehiclesWithDanger] = useState<VehicleWithDanger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gateVisible, setGateVisible] = useState(false);
  const [transferBusy, setTransferBusy] = useState<number | null>(null);

  const pendingAddCar = useRef(false);

  const sortedVehicles = useMemo(() => {
    return [...vehiclesWithDanger].sort((a, b) => b.dangerCount - a.dangerCount);
  }, [vehiclesWithDanger]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        try {
          setLoading(true);
          setError(null);
          const result = await getAllVehicles();
          if (cancelled) return;

          setVehicleCount(result.length);

          // Load maintenance data for danger counts
          const deviceId = await getDeviceId();
          let logTypes: LogTypeRow[] = [];
          let device = null;
          let allLogsMap: Record<number, UserLogRow[]> = {};

          if (deviceId) {
            const [lt, dev] = await Promise.all([
              getAllLogTypes(),
              getDeviceByDeviceId(deviceId),
            ]);
            logTypes = lt;
            device = dev;

            const logsPromises = result.map((v) =>
              getLogsByVehicleId(v.id, deviceId).then((logs) => ({
                vehicleId: v.id,
                logs,
              })),
            );
            const logsResults = await Promise.all(logsPromises);
            for (const { vehicleId, logs } of logsResults) {
              allLogsMap[vehicleId] = logs;
            }
          }

          if (cancelled) return;

          const unit = device?.unit ?? 'km';
          const withDanger: VehicleWithDanger[] = result.map((v) => ({
            vehicle: v,
            dangerCount: getVehicleDangerCount(
              v,
              logTypes,
              allLogsMap[v.id] ?? [],
              unit,
            ),
          }));

          setVehiclesWithDanger(withDanger);

          if (pendingAddCar.current) {
            pendingAddCar.current = false;
            const updatedPlan = await loadEntitlement();
            if (cancelled) return;

            if (canAddVehicle(updatedPlan, result.length)) {
              navigateToAddVehicle();
            } else {
              navigation.navigate(routes.paywall);
            }
          }
        } catch (e) {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : 'Failed to load vehicles');
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();
      return () => { cancelled = true; };
    }, [isAuthenticated]),
  );

  function navigateToAddVehicle() {
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

  function handleSelectVehicle(vehicle: VehicleRow) {
    setActiveVehicleId(vehicle.id);
    navigation.navigate(routes.vehicle);
  }

  function handleAddAnotherCar() {
    if (isGuest) {
      setGateVisible(true);
      return;
    }

    const currentPlan = getEntitlementStore().plan;
    const vehicleCount = vehiclesWithDanger.length;
    if (canAddVehicle(currentPlan, vehicleCount)) {
      navigateToAddVehicle();
    } else {
      navigation.navigate(routes.paywall);
    }
  }

  function handleGateSignIn() {
    setGateVisible(false);
    pendingAddCar.current = true;
    navigation.navigate(routes.auth);
  }

  async function handleAcceptTransfer(requestId: number) {
    setTransferBusy(requestId);
    try {
      await acceptTransfer(requestId);
      await refreshTransfers();
      const result = await getAllVehicles();
      setVehicleCount(result.length);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not accept transfer.');
    } finally {
      setTransferBusy(null);
    }
  }

  async function handleDeclineTransfer(requestId: number) {
    Alert.alert(
      'Decline Transfer',
      'Are you sure you want to decline this vehicle transfer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setTransferBusy(requestId);
            try {
              await declineTransfer(requestId);
              await refreshTransfers();
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Could not decline transfer.');
            } finally {
              setTransferBusy(null);
            }
          },
        },
      ],
    );
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const showUpgradeCard = plan === 'free';

  return (
    <View className="flex-1 bg-[#0C111F]">
      <SignInGateModal
        visible={gateVisible}
        onSignIn={handleGateSignIn}
        onCancel={() => setGateVisible(false)}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 16,
          paddingBottom: 32,
        }}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between">
          <View>
            <Text
              className="text-3xl text-white"
              style={{ fontFamily: 'Poppins-ExtraBold' }}
            >
              My Garage
            </Text>
            <Text
              className="mt-1 text-sm text-[#A3ACBF]"
              style={{ fontFamily: 'Poppins' }}
            >
              {vehiclesWithDanger.length}{' '}
              {vehiclesWithDanger.length === 1 ? 'vehicle' : 'vehicles'}
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate(routes.account)}
            className="rounded-full bg-[#141A2B] p-2.5"
            hitSlop={8}
          >
            <AccountIcon size={24} />
          </Pressable>
        </View>

        {/* New car button (hidden for free users) */}
        {!showUpgradeCard ? (
          <View className="mt-5">
            <PrimaryButton label="New car" onPress={handleAddAnotherCar} />
          </View>
        ) : null}

        {/* Upgrade card for free users */}
        {showUpgradeCard ? (
          <View className="mt-4">
            <ExpandGarageCard onPress={() => navigation.navigate(routes.paywall)} />
          </View>
        ) : null}

        {/* Incoming transfer requests */}
        {transferRequests.length > 0 ? (
          <View style={{ gap: 12, marginTop: 16 }}>
            <Text
              className="text-sm text-[#A3ACBF]"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              Transfer Requests
            </Text>
            {transferRequests.map((req) => (
              <TransferRequestCard
                key={req.requestId}
                request={req}
                onAccept={() => handleAcceptTransfer(req.requestId)}
                onDecline={() => handleDeclineTransfer(req.requestId)}
                busy={transferBusy === req.requestId}
              />
            ))}
          </View>
        ) : null}

        {/* Vehicle list */}
        <View style={{ gap: 16, marginTop: 16 }}>
          {sortedVehicles.map(({ vehicle, dangerCount }) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              dangerCount={dangerCount}
              onPress={() => handleSelectVehicle(vehicle)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
