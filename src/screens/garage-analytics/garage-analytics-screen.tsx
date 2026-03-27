import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OutlineButton } from '@/components/buttons/outline-button';
import { ContentCard } from '@/components/cards/content-card';
import { BottomSheet, BottomSheetOption } from '@/components/feedback/bottom-sheet';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { BackArrowIcon, ChevronDownIcon, ChevronRightIcon } from '@/components/icons/app-icons';
import { CostIcon } from '@/components/icons/row-icons';
import { useCurrency } from '@/hooks/use-currency';
import { formatAmount } from '@/hooks/use-spending-summary';
import { routes } from '@/navigation/routes';
import type { LogCategoryRow } from '@/services/api/category-api';
import type { LogTypeRow } from '@/services/api/log-type-api';
import type { UserLogRow } from '@/services/api/user-log-api';
import type { VehicleRow } from '@/services/api/vehicle-api';
import { getAllCategories } from '@/services/api/category-api';
import { getDeviceByDeviceId } from '@/services/api/device-api';
import { getAllLogTypes } from '@/services/api/log-type-api';
import { getLogsByVehicleId } from '@/services/api/user-log-api';
import { getAllVehicles } from '@/services/vehicle-service';
import { getDeviceId } from '@/services/storage-service';
import { getFleetDataCache, isFleetDataFresh, setFleetDataCache } from '@/store/fleet-data-cache';
import {
  computeFleetCategoryBreakdown,
  computeFleetThisMonthSpending,
  computeFleetVehicleBreakdown,
  computeFleetYearMonthlyTotals,
  computeFleetYearSpending,
} from '@/utils/calculations/fleet-spending-analytics';
import type {
  FleetCategoryTotal,
  FleetVehicleLog,
  FleetVehicleSummary,
  MonthlyTotal,
} from '@/utils/calculations/fleet-spending-analytics';
import type { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.garageAnalytics>;

type VehicleWithLogs = { vehicle: VehicleRow; logs: UserLogRow[] };

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 5;
const NOW_MONTH_KEY = `${CURRENT_YEAR}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
const ANIM_DURATION = 600;

const YEAR_OPTIONS: number[] = [];
for (let y = CURRENT_YEAR; y >= MIN_YEAR; y--) YEAR_OPTIONS.push(y);

// ── Shared animation progress ────────────────────────────────────────

function useAnimatedProgress(key: number) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: ANIM_DURATION, useNativeDriver: false }).start();
  }, [key, anim]);
  return anim;
}

// ── Animated number ──────────────────────────────────────────────────

function AnimatedNumber({
  value,
  progress,
  formatter,
}: {
  value: number;
  progress: Animated.Value;
  formatter: (n: number) => string;
}) {
  const [display, setDisplay] = useState(formatter(0));
  useEffect(() => {
    const id = progress.addListener(({ value: p }) => setDisplay(formatter(Math.round(value * p))));
    return () => progress.removeListener(id);
  }, [value, progress, formatter]);

  return (
    <Text className="mt-0.5 text-[20px]" style={{ fontFamily: 'Poppins-SemiBold', color: '#367DFF' }}>
      {display}
    </Text>
  );
}

// ── Bar chart ────────────────────────────────────────────────────────

function YearBarChart({
  data,
  currencySymbol,
  progress,
}: {
  data: MonthlyTotal[];
  currencySymbol: string;
  progress: Animated.Value;
}) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  return (
    <View className="flex-row items-end justify-between" style={{ height: 150 }}>
      {data.map((bar) => {
        const isCurrent = bar.month === NOW_MONTH_KEY;
        const targetHeight = Math.max((bar.total / maxVal) * 100, 4);
        const barColor = isCurrent ? '#34D399' : '#367DFF';
        const animHeight = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [4, targetHeight],
        });
        return (
          <View key={bar.month} className="flex-1 items-center">
            {isCurrent && bar.total > 0 ? (
              <Text className="mb-1 text-[10px]" style={{ fontFamily: 'Poppins-SemiBold', color: '#34D399' }}>
                {currencySymbol}{formatNum(Math.round(bar.total))}
              </Text>
            ) : (
              <View style={{ height: 16 }} />
            )}
            <Animated.View
              className="w-5 rounded-t-md"
              style={{ height: animHeight, backgroundColor: bar.total > 0 ? barColor : '#1F2740' }}
            />
            <Text
              className="mt-2 text-[10px]"
              style={{ fontFamily: isCurrent ? 'Poppins-SemiBold' : 'Poppins', color: isCurrent ? '#FFFFFF' : '#A3ACBF' }}
            >
              {bar.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Stat card ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  progress,
  currencySymbol,
}: {
  label: string;
  value: number;
  sub?: string;
  progress: Animated.Value;
  currencySymbol: string;
}) {
  const fmt = useMemo(() => (n: number) => formatAmount(n, currencySymbol), [currencySymbol]);
  return (
    <ContentCard className="flex-1">
      <Text className="text-[12px] text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>{label}</Text>
      <AnimatedNumber value={value} progress={progress} formatter={fmt} />
      {sub ? (
        <Text className="text-[12px] text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>{sub}</Text>
      ) : null}
    </ContentCard>
  );
}

// ── Category row ─────────────────────────────────────────────────────

function CategoryRow({
  item,
  grandTotal,
  isTop,
  currencySymbol,
  progress,
}: {
  item: FleetCategoryTotal;
  grandTotal: number;
  isTop: boolean;
  currencySymbol: string;
  progress: Animated.Value;
}) {
  const pct = grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0;
  const animWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${Math.max(pct, 2)}%`] });
  return (
    <View style={{ marginTop: 18 }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1">
          {item.iconUrl ? (
            <Image source={{ uri: item.iconUrl }} style={{ width: 20, height: 20 }} resizeMode="contain" />
          ) : null}
          <Text
            className="text-sm text-white"
            style={{ fontFamily: isTop ? 'Poppins-Bold' : 'Poppins-SemiBold' }}
          >
            {item.categoryName}
          </Text>
          <Text className="text-[11px]" style={{ fontFamily: 'Poppins', color: isTop ? '#367DFF' : '#6B7490' }}>
            {pct}%
          </Text>
        </View>
        <Text className="text-sm text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
          {currencySymbol}{formatNum(item.total)}
        </Text>
      </View>
      <View className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#0C111F]">
        <Animated.View className="h-2 rounded-full" style={{ width: animWidth, backgroundColor: '#367DFF' }} />
      </View>
    </View>
  );
}

// ── Vehicle row (expandable) ─────────────────────────────────────────

function VehicleRow({
  item,
  currencySymbol,
}: {
  item: FleetVehicleSummary;
  currencySymbol: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="border-b border-[#1F2740]">
      <Pressable
        onPress={() => setExpanded((p) => !p)}
        className="flex-row items-center py-3"
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        {item.vehicleImageUrl ? (
          <Image
            source={{ uri: item.vehicleImageUrl }}
            className="h-10 w-10 rounded-lg bg-[#1A2240]"
            resizeMode="cover"
          />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-[#1A2240]">
            <Text className="text-sm opacity-30">{'\uD83D\uDE97'}</Text>
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }} numberOfLines={1}>
            {item.vehicleName}
            {item.vehicleYear ? `, ${item.vehicleYear}` : ''}
          </Text>
        </View>
        <Text className="ml-2 text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
          {currencySymbol}{formatNum(item.total)}
        </Text>
        <View style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }], marginLeft: 8 }}>
          <ChevronRightIcon size={16} color="#6B7490" />
        </View>
      </Pressable>

      {expanded && item.recentLogs.length > 0 ? (
        <View className="mb-3 ml-[52px]" style={{ gap: 6 }}>
          {item.recentLogs.map((log) => (
            <LogDetail key={log.logId} log={log} currencySymbol={currencySymbol} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function LogDetail({ log, currencySymbol }: { log: FleetVehicleLog; currencySymbol: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2 flex-1">
        <View className="h-6 w-6 items-center justify-center rounded-md bg-[#0C111F]">
          <CostIcon size={12} color="#6B7490" />
        </View>
        <Text className="text-[12px] text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }} numberOfLines={1}>
          {log.logTypeName}
        </Text>
        <Text className="text-[11px] text-[#6B7490]" style={{ fontFamily: 'Poppins' }}>
          {formatDate(log.date)}
        </Text>
      </View>
      <Text className="text-[12px] text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
        {currencySymbol}{formatNum(log.cost)}
      </Text>
    </View>
  );
}

// ── Tab selector ─────────────────────────────────────────────────────

function TabSelector({
  tabs,
  active,
  onSelect,
}: {
  tabs: string[];
  active: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <View className="flex-row rounded-xl bg-[#0C111F] p-1">
      {tabs.map((label, idx) => {
        const isActive = idx === active;
        return (
          <Pressable
            key={label}
            onPress={() => onSelect(idx)}
            className={`flex-1 items-center rounded-lg py-2 ${isActive ? 'bg-[#141A2B]' : ''}`}
          >
            <Text
              className={`text-sm ${isActive ? 'text-white' : 'text-[#6B7490]'}`}
              style={{ fontFamily: isActive ? 'Poppins-SemiBold' : 'Poppins' }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function formatNum(n: number): string {
  return n % 1 === 0
    ? Math.round(n).toLocaleString('en-US')
    : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}

// ── Year-scoped data hook ────────────────────────────────────────────

function useFleetYearData(
  vehiclesWithLogs: VehicleWithLogs[],
  logTypes: LogTypeRow[],
  categories: LogCategoryRow[],
  year: number,
) {
  return useMemo(() => {
    const isCurrentYear = year === CURRENT_YEAR;
    const monthlyTotals = computeFleetYearMonthlyTotals(vehiclesWithLogs, year);
    const yearSpending = computeFleetYearSpending(vehiclesWithLogs, year);
    const thisMonth = isCurrentYear ? computeFleetThisMonthSpending(vehiclesWithLogs) : null;
    const categoryBreakdown = computeFleetCategoryBreakdown(vehiclesWithLogs, logTypes, categories, year);
    const vehicleBreakdown = computeFleetVehicleBreakdown(vehiclesWithLogs, logTypes, year);

    const monthsWithData = monthlyTotals.filter((m) => m.total > 0).length;
    const avgMonthly = monthsWithData > 0 ? Math.round((yearSpending.total / monthsWithData) * 100) / 100 : 0;

    return {
      isCurrentYear,
      monthlyTotals,
      yearTotal: yearSpending.total,
      yearCount: yearSpending.count,
      thisMonth,
      avgMonthly,
      monthsWithData,
      categoryBreakdown,
      vehicleBreakdown,
    };
  }, [vehiclesWithLogs, logTypes, categories, year]);
}

// ── Screen ───────────────────────────────────────────────────────────

export function GarageAnalyticsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [vehiclesWithLogs, setVehiclesWithLogs] = useState<VehicleWithLogs[]>([]);
  const [logTypes, setLogTypes] = useState<LogTypeRow[]>([]);
  const [categories, setCategories] = useState<LogCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { currencySymbol } = useCurrency();
  const progress = useAnimatedProgress(selectedYear);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        const cached = getFleetDataCache();
        if (cached && isFleetDataFresh()) {
          const vwl: VehicleWithLogs[] = cached.vehicles.map((v) => ({
            vehicle: v,
            logs: cached.logsMap[v.id] ?? [],
          }));
          setVehiclesWithLogs(vwl);
          setLogTypes(cached.logTypes);
          setCategories(cached.categories);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError(null);
          const deviceId = await getDeviceId();
          if (!deviceId) { setLoading(false); return; }

          const [vehicles, lt, cats, dev] = await Promise.all([
            getAllVehicles(),
            getAllLogTypes(),
            getAllCategories(),
            getDeviceByDeviceId(deviceId),
          ]);
          if (cancelled) return;

          const logsMap: Record<number, UserLogRow[]> = {};
          const logsResults = await Promise.all(
            vehicles.map((v) => getLogsByVehicleId(v.id, deviceId).then((logs) => ({ vehicleId: v.id, logs }))),
          );
          for (const { vehicleId, logs } of logsResults) logsMap[vehicleId] = logs;
          if (cancelled) return;

          setFleetDataCache({
            vehicles,
            logsMap,
            logTypes: lt,
            categories: cats,
            currencyCode: dev?.currency_code ?? null,
            unit: dev?.unit ?? 'km',
          });

          setVehiclesWithLogs(vehicles.map((v) => ({ vehicle: v, logs: logsMap[v.id] ?? [] })));
          setLogTypes(lt);
          setCategories(cats);
        } catch (e) {
          if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load data');
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();
      return () => { cancelled = true; };
    }, []),
  );

  const yearData = useFleetYearData(vehiclesWithLogs, logTypes, categories, selectedYear);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => navigation.goBack()} />;

  const breakdownTotal = yearData.categoryBreakdown.reduce((s, c) => s + c.total, 0);

  return (
    <View className="flex-1 bg-[#0C111F]">
      <BottomSheet visible={pickerOpen} onClose={() => setPickerOpen(false)} title="Select Year">
        {YEAR_OPTIONS.map((y) => (
          <BottomSheetOption
            key={y}
            label={`${y}${y === CURRENT_YEAR ? ' (current)' : ''}`}
            onPress={() => { setSelectedYear(y); setPickerOpen(false); }}
          />
        ))}
      </BottomSheet>

      <Pressable
        onPress={() => navigation.goBack()}
        className="absolute z-10 rounded-full bg-black/40 p-2"
        style={{ top: insets.top + 8, left: 16 }}
        hitSlop={8}
      >
        <BackArrowIcon size={24} />
      </Pressable>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 46, paddingHorizontal: 16, paddingBottom: 32 }}
      >
        <Text className="text-[28px] text-white" style={{ fontFamily: 'Poppins-ExtraBold' }}>
          Fleet Analytics
        </Text>

        <View style={{ gap: 13, marginTop: 4 }}>
          {/* Chart card with year selector */}
          <ContentCard>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
                Monthly Spending
              </Text>
              <Pressable onPress={() => setPickerOpen(true)} className="flex-row items-center gap-1" hitSlop={12}>
                <Text className="text-base text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
                  {selectedYear}
                </Text>
                <ChevronDownIcon size={14} color="#A3ACBF" />
              </Pressable>
            </View>
            <YearBarChart data={yearData.monthlyTotals} currencySymbol={currencySymbol} progress={progress} />
          </ContentCard>

          {/* Stat cards */}
          <View className="flex-row gap-3">
            {yearData.isCurrentYear && yearData.thisMonth ? (
              <StatCard
                label="This Month"
                value={yearData.thisMonth.total}
                sub={`${yearData.thisMonth.count} ${pluralize(yearData.thisMonth.count, 'service')}`}
                progress={progress}
                currencySymbol={currencySymbol}
              />
            ) : (
              <StatCard
                label="Avg. Monthly"
                value={yearData.avgMonthly}
                sub={`across ${yearData.monthsWithData} ${pluralize(yearData.monthsWithData, 'month')}`}
                progress={progress}
                currencySymbol={currencySymbol}
              />
            )}
            <StatCard
              label={yearData.isCurrentYear ? 'This Year' : String(selectedYear)}
              value={yearData.yearTotal}
              sub={`${yearData.yearCount} ${pluralize(yearData.yearCount, 'service')}`}
              progress={progress}
              currencySymbol={currencySymbol}
            />
          </View>

          {/* Export button */}
          <OutlineButton label="Export Spending Data" onPress={() => navigation.navigate(routes.export)} />

          {/* Tab selector */}
          <TabSelector tabs={['Vehicles', 'Categories']} active={activeTab} onSelect={setActiveTab} />

          {/* Tab content */}
          {activeTab === 0 ? (
            yearData.vehicleBreakdown.length > 0 ? (
              <ContentCard>
                {yearData.vehicleBreakdown.map((v) => (
                  <VehicleRow key={v.vehicleId} item={v} currencySymbol={currencySymbol} />
                ))}
              </ContentCard>
            ) : (
              <ContentCard>
                <Text className="text-center text-sm text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
                  No vehicle spending data for {selectedYear}.
                </Text>
              </ContentCard>
            )
          ) : yearData.categoryBreakdown.length > 0 ? (
            <ContentCard>
              {yearData.categoryBreakdown.map((cat, idx) => (
                <CategoryRow
                  key={cat.categoryId}
                  item={cat}
                  grandTotal={breakdownTotal}
                  isTop={idx === 0}
                  currencySymbol={currencySymbol}
                  progress={progress}
                />
              ))}
            </ContentCard>
          ) : (
            <ContentCard>
              <Text className="text-center text-sm text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
                No category spending data for {selectedYear}.
              </Text>
            </ContentCard>
          )}

          {/* Empty state */}
          {yearData.yearTotal === 0 ? (
            <ContentCard>
              <Text className="text-center text-sm text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
                No spending data for {selectedYear}. Add costs to your maintenance logs to see fleet analytics here.
              </Text>
            </ContentCard>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
