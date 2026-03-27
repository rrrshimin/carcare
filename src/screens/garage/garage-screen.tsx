import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OutlineButton } from '@/components/buttons/outline-button';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { TransferRequestCard } from '@/components/cards/transfer-request-card';
import { SignInGateModal } from '@/components/feedback/sign-in-gate-modal';
import { LoadingState } from '@/components/feedback/loading-state';
import { ErrorState } from '@/components/feedback/error-state';
import { AccountIcon, BarChartIcon, ChevronRightIcon, CrownIcon, DangerIcon, SearchIcon, SubscriptionStarIcon } from '@/components/icons/app-icons';
import { useAuth } from '@/context/auth-context';
import { useCurrency } from '@/hooks/use-currency';
import { useEntitlement, loadEntitlement } from '@/hooks/use-entitlement';
import { formatAmount } from '@/hooks/use-spending-summary';
import { useTransferRequests } from '@/hooks/use-transfer-requests';
import { getVehicleDangerCount } from '@/features/maintenance/get-vehicle-danger-count';
import { routes } from '@/navigation/routes';
import { canAddVehicle } from '@/services/entitlement-service';
import { acceptTransfer, declineTransfer } from '@/services/transfer-service';
import type { VehicleRow } from '@/services/api/vehicle-api';
import type { LogTypeRow } from '@/services/api/log-type-api';
import type { LogCategoryRow } from '@/services/api/category-api';
import type { UserLogRow } from '@/services/api/user-log-api';
import { getAllCategories } from '@/services/api/category-api';
import { getAllLogTypes } from '@/services/api/log-type-api';
import { getLogsByVehicleId } from '@/services/api/user-log-api';
import { getDeviceByDeviceId } from '@/services/api/device-api';
import { getAllVehicles } from '@/services/vehicle-service';
import { getDeviceId } from '@/services/storage-service';
import { getEntitlementStore } from '@/store/entitlement-store';
import { setFleetDataCache } from '@/store/fleet-data-cache';
import { setActiveVehicleId, setVehicleCount } from '@/store/vehicle-store';
import {
  computeFleetThisMonthSpending,
  computeFleetYearSpending,
} from '@/utils/calculations/fleet-spending-analytics';
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
            className="mt-1 text-[13px] text-[#A3ACBF]"
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

// ── Fleet analytics card (Pro only) ──────────────────────────────────

function FleetAnalyticsCard({
  thisMonth,
  thisYear,
  currencySymbol,
  onPress,
}: {
  thisMonth: number;
  thisYear: number;
  currencySymbol: string;
  onPress: () => void;
}) {
  const hasData = thisMonth > 0 || thisYear > 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <View className="flex-row items-center rounded-2xl bg-[#141A2B] px-4 py-4">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#0C111F]">
          <BarChartIcon size={22} color="#367DFF" />
        </View>
        <View className="flex-1">
          <Text
            className="text-[15px] text-white"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Fleet Spending
          </Text>
          <Text
            className="mt-0.5 text-[12px] text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
            numberOfLines={1}
          >
            {hasData
              ? `${formatAmount(thisMonth, currencySymbol)} this month \u00B7 ${formatAmount(thisYear, currencySymbol)} this year`
              : 'Track fleet-wide spending analytics'}
          </Text>
        </View>
        <ChevronRightIcon size={20} color="#A3ACBF" />
      </View>
    </Pressable>
  );
}

// ── Vehicle card (full — used for non-Pro users) ─────────────────────

function VehicleCard({
  vehicle,
  dangerCount,
  unit,
  onPress,
}: {
  vehicle: VehicleRow;
  dangerCount: number;
  unit: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <View className="overflow-hidden rounded-2xl bg-[#141A2B]">
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

        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-1">
            <Text
              className="text-base text-white text-[16px]"
              style={{ fontFamily: 'Poppins-Bold' }}
              numberOfLines={1}
            >
              {vehicle.name}
              {vehicle.year ? `, ${vehicle.year}` : ''}
            </Text>
            <Text
              className="mt-1.5 text-[12px] text-[#A3ACBF]"
              style={{ fontFamily: 'Poppins' }}
              numberOfLines={1}
            >
              {(vehicle.current_odometer ?? 0).toLocaleString()} {unit}
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
                  className="text-[12px] text-[#6B7490]"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Inactive
                </Text>
              </View>
            ) : dangerCount > 0 ? (
              <View className="flex-row items-center gap-1 rounded-full bg-[#FF8126]/15 px-2.5 py-1">
                <DangerIcon size={14} />
                <Text
                  className="text-[12px] text-[#FF8126]"
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

// ── Compact vehicle card (Pro users) ─────────────────────────────────

function CompactVehicleCard({
  vehicle,
  dangerCount,
  unit,
  onPress,
}: {
  vehicle: VehicleRow;
  dangerCount: number;
  unit: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <View className="flex-row items-center rounded-2xl bg-[#141A2B] px-3 py-3">
        {vehicle.image_url ? (
          <Image
            source={{ uri: vehicle.image_url }}
            className="h-12 w-12 rounded-xl bg-[#1A2240]"
            resizeMode="cover"
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#1A2240]">
            <Text className="text-lg opacity-30">{'\uD83D\uDE97'}</Text>
          </View>
        )}

        <View className="ml-3 flex-1">
          <Text
            className="text-[14px] text-white"
            style={{ fontFamily: 'Poppins-SemiBold' }}
            numberOfLines={1}
          >
            {vehicle.name}
            {vehicle.year ? `, ${vehicle.year}` : ''}
          </Text>
          <Text
            className="mt-0.5 text-[11px] text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
            numberOfLines={1}
          >
            {(vehicle.current_odometer ?? 0).toLocaleString()} {unit}
            {' \u2022 '}
            {capitalize(vehicle.fuel_type ?? 'petrol')}
            {' \u2022 '}
            {capitalize(vehicle.transmission ?? 'manual')}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {vehicle.is_active === false ? (
            <View className="rounded-full bg-[#1A2240] px-2 py-0.5">
              <Text
                className="text-[11px] text-[#6B7490]"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Inactive
              </Text>
            </View>
          ) : dangerCount > 0 ? (
            <View className="flex-row items-center gap-1 rounded-full bg-[#FF8126]/15 px-2 py-0.5">
              <DangerIcon size={12} />
              <Text
                className="text-[11px] text-[#FF8126]"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                {dangerCount}
              </Text>
            </View>
          ) : null}
          <ChevronRightIcon size={18} color="#A3ACBF" />
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
  const { currencySymbol } = useCurrency();
  const { requests: transferRequests, refresh: refreshTransfers } = useTransferRequests(isAuthenticated);
  const [vehiclesWithDanger, setVehiclesWithDanger] = useState<VehicleWithDanger[]>([]);
  const [allLogsMapState, setAllLogsMapState] = useState<Record<number, UserLogRow[]>>({});
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const [retryKey, setRetryKey] = useState(0);
  const [gateVisible, setGateVisible] = useState(false);
  const [transferBusy, setTransferBusy] = useState<number | null>(null);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingAddCar = useRef(false);
  const isPro = plan === 'pro';

  const fleetThisMonth = useMemo(() => {
    if (!isPro) return 0;
    const vehiclesWithLogs = vehiclesWithDanger.map(({ vehicle }) => ({
      vehicle,
      logs: allLogsMapState[vehicle.id] ?? [],
    }));
    return computeFleetThisMonthSpending(vehiclesWithLogs).total;
  }, [isPro, vehiclesWithDanger, allLogsMapState]);

  const fleetThisYear = useMemo(() => {
    if (!isPro) return 0;
    const vehiclesWithLogs = vehiclesWithDanger.map(({ vehicle }) => ({
      vehicle,
      logs: allLogsMapState[vehicle.id] ?? [],
    }));
    return computeFleetYearSpending(vehiclesWithLogs, new Date().getFullYear()).total;
  }, [isPro, vehiclesWithDanger, allLogsMapState]);

  const sortedVehicles = useMemo(() => {
    const sorted = [...vehiclesWithDanger].sort((a, b) => b.dangerCount - a.dangerCount);
    if (!searchQuery.trim()) return sorted;

    const q = searchQuery.trim().toLowerCase();
    return sorted.filter(({ vehicle }) => {
      const name = (vehicle.name ?? '').toLowerCase();
      const year = String(vehicle.year ?? '');
      return name.includes(q) || year.includes(q);
    });
  }, [vehiclesWithDanger, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        try {
          if (!hasLoadedRef.current) setLoading(true);
          setError(null);
          const result = await getAllVehicles();
          if (cancelled) return;

          setVehicleCount(result.length);

          const deviceId = await getDeviceId();
          let logTypes: LogTypeRow[] = [];
          let categories: LogCategoryRow[] = [];
          let device = null;
          let allLogsMap: Record<number, UserLogRow[]> = {};

          if (deviceId) {
            const [lt, cats, dev] = await Promise.all([
              getAllLogTypes(),
              getAllCategories(),
              getDeviceByDeviceId(deviceId),
            ]);
            logTypes = lt;
            categories = cats;
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
          setDistanceUnit(unit);
          setAllLogsMapState(allLogsMap);

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
          hasLoadedRef.current = true;

          setFleetDataCache({
            vehicles: result,
            logsMap: allLogsMap,
            logTypes,
            categories,
            currencyCode: device?.currency_code ?? null,
            unit,
          });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, retryKey]),
  );

  function navigateToAddVehicle() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: routes.setupFlow,
            state: {
              routes: [
                { name: routes.addVehicle, params: { mode: 'add-another' } },
              ],
            },
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
    const currentPlan = getEntitlementStore().plan;
    const vehicleCount = vehiclesWithDanger.length;

    if (!canAddVehicle(currentPlan, vehicleCount)) {
      navigation.navigate(routes.paywall);
      return;
    }

    if (isGuest) {
      setGateVisible(true);
      return;
    }

    navigateToAddVehicle();
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

  if (loading && vehiclesWithDanger.length === 0) return <LoadingState />;
  if (error && vehiclesWithDanger.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          hasLoadedRef.current = false;
          setRetryKey((k) => k + 1);
        }}
      />
    );
  }

  const showUpgradeCard = plan === 'free';
  const needsUpgradeToAdd = !canAddVehicle(plan, vehiclesWithDanger.length);

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

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                setSearchActive((prev) => {
                  if (prev) setSearchQuery('');
                  return !prev;
                });
              }}
              className="rounded-full bg-[#141A2B] p-2.5"
              hitSlop={8}
            >
              <SearchIcon size={22} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate(routes.account)}
              className="rounded-full bg-[#141A2B] p-2.5"
              hitSlop={8}
            >
              <AccountIcon size={24} />
            </Pressable>
          </View>
        </View>

        {/* Search bar */}
        {searchActive ? (
          <View className="mt-3">
            <TextInput
              className="rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-3 text-sm text-white"
              style={{ fontFamily: 'Poppins' }}
              placeholder="Search vehicles..."
              placeholderTextColor="#6B7490"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
          </View>
        ) : null}

        {/* Fleet analytics card — Pro only */}
        {isPro ? (
          <View className="mt-4">
            <FleetAnalyticsCard
              thisMonth={fleetThisMonth}
              thisYear={fleetThisYear}
              currencySymbol={currencySymbol}
              onPress={() => navigation.navigate(routes.garageAnalytics)}
            />
          </View>
        ) : null}

        {/* New car button */}
        <View className="mt-4">
          {plan === 'free' ? (
            <OutlineButton
              label="New car"
              onPress={handleAddAnotherCar}
              icon={<CrownIcon size={18} color="#FFCE1E" />}
            />
          ) : (
            <PrimaryButton
              label="New car"
              onPress={handleAddAnotherCar}
              icon={needsUpgradeToAdd ? <CrownIcon size={18} /> : undefined}
            />
          )}
        </View>

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
        <View style={{ gap: isPro ? 8 : 16, marginTop: 16 }}>
          {sortedVehicles.map(({ vehicle, dangerCount }) =>
            isPro ? (
              <CompactVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                dangerCount={dangerCount}
                unit={distanceUnit}
                onPress={() => handleSelectVehicle(vehicle)}
              />
            ) : (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                dangerCount={dangerCount}
                unit={distanceUnit}
                onPress={() => handleSelectVehicle(vehicle)}
              />
            ),
          )}
        </View>

        {/* Subscription prompt for all free-plan users (guest or logged-in) */}
        {showUpgradeCard ? (
          <View className="mt-4">
            <ExpandGarageCard onPress={() => navigation.navigate(routes.paywall)} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
