import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { ContentCard } from '@/components/cards/content-card';
import { BottomSheet, BottomSheetOption } from '@/components/feedback/bottom-sheet';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { BackArrowIcon, ChevronDownIcon } from '@/components/icons/app-icons';
import { CostIcon } from '@/components/icons/row-icons';
import { useCurrency } from '@/hooks/use-currency';
import { useEntitlement } from '@/hooks/use-entitlement';
import { formatAmount } from '@/hooks/use-spending-summary';
import { useVehicleData } from '@/hooks/use-vehicle-data';
import { routes } from '@/navigation/routes';
import {
  computeYearMonthlyTotals,
  computeYearSpending,
  computeYearCategoryBreakdown,
  computeYearRecentExpenses,
  computeThisMonthSpending,
} from '@/utils/calculations/spending-analytics';
import type { MonthlyTotal, CategoryTotal, RecentExpense } from '@/utils/calculations/spending-analytics';
import type { UserLogRow } from '@/services/api/user-log-api';
import type { LogTypeRow } from '@/services/api/log-type-api';
import type { LogCategoryRow } from '@/services/api/category-api';
import type { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.spending>;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 5;
const NOW_MONTH_KEY = `${CURRENT_YEAR}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
const ANIM_DURATION = 600;

const YEAR_OPTIONS: number[] = [];
for (let y = CURRENT_YEAR; y >= MIN_YEAR; y--) YEAR_OPTIONS.push(y);

// ── Shared animation progress (0→1), resets on key change ────────────

function useAnimatedProgress(key: number) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: ANIM_DURATION,
      useNativeDriver: false,
    }).start();
  }, [key, anim]);

  return anim;
}

// ── Animated number display ──────────────────────────────────────────

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
    const id = progress.addListener(({ value: p }) => {
      setDisplay(formatter(Math.round(value * p)));
    });
    return () => progress.removeListener(id);
  }, [value, progress, formatter]);

  return (
    <Text
      className="mt-0.5 text-[20px]"
      style={{ fontFamily: 'Poppins-SemiBold', color: '#367DFF' }}
    >
      {display}
    </Text>
  );
}

// ── Year-scoped data hook ────────────────────────────────────────────

function useYearScopedData(
  logs: UserLogRow[],
  logTypes: LogTypeRow[],
  categories: LogCategoryRow[],
  year: number,
) {
  return useMemo(() => {
    const isCurrentYear = year === CURRENT_YEAR;
    const monthlyTotals = computeYearMonthlyTotals(logs, year);
    const yearSpending = computeYearSpending(logs, year);
    const breakdown = computeYearCategoryBreakdown(logs, logTypes, categories, year);
    const recent = computeYearRecentExpenses(logs, logTypes, categories, year);
    const topCategory = breakdown.length > 0 ? breakdown[0] : null;

    const thisMonth = isCurrentYear ? computeThisMonthSpending(logs) : null;

    const monthsWithData = monthlyTotals.filter((m) => m.total > 0).length;
    const avgMonthly = monthsWithData > 0
      ? Math.round((yearSpending.total / monthsWithData) * 100) / 100
      : 0;

    return {
      isCurrentYear,
      monthlyTotals,
      yearTotal: yearSpending.total,
      yearCount: yearSpending.count,
      thisMonth,
      avgMonthly,
      monthsWithData,
      topCategory,
      breakdown,
      recent,
    };
  }, [logs, logTypes, categories, year]);
}

// ── Animated bar chart ───────────────────────────────────────────────

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
              <Text
                className="mb-1 text-[10px]"
                style={{ fontFamily: 'Poppins-SemiBold', color: '#34D399' }}
              >
                {currencySymbol}{formatNum(Math.round(bar.total))}
              </Text>
            ) : (
              <View style={{ height: 16 }} />
            )}
            <Animated.View
              className="w-5 rounded-t-md"
              style={{
                height: animHeight,
                backgroundColor: bar.total > 0 ? barColor : '#1F2740',
              }}
            />
            <Text
              className="mt-2 text-[10px]"
              style={{
                fontFamily: isCurrent ? 'Poppins-SemiBold' : 'Poppins',
                color: isCurrent ? '#FFFFFF' : '#A3ACBF',
              }}
            >
              {bar.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Summary stat card (with animated number) ─────────────────────────

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
  const fmt = useMemo(
    () => (n: number) => formatAmount(n, currencySymbol),
    [currencySymbol],
  );

  return (
    <ContentCard className="flex-1">
      <Text className="text-[12px] text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
        {label}
      </Text>
      <AnimatedNumber value={value} progress={progress} formatter={fmt} />
      {sub ? (
        <Text className=" text-[12px] text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
          {sub}
        </Text>
      ) : null}
    </ContentCard>
  );
}

// ── Animated category breakdown row ──────────────────────────────────

function CategoryRow({
  item,
  grandTotal,
  isTop,
  currencySymbol,
  progress,
}: {
  item: CategoryTotal;
  grandTotal: number;
  isTop: boolean;
  currencySymbol: string;
  progress: Animated.Value;
}) {
  const pct = grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0;

  const animWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${Math.max(pct, 2)}%`],
  });

  return (
    <View style={{ marginTop: 18 }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1">
          <Text
            className="text-sm text-white"
            style={{ fontFamily: isTop ? 'Poppins-Bold' : 'Poppins-SemiBold' }}
          >
            {item.categoryName}
          </Text>
          <Text
            className="text-[11px]"
            style={{ fontFamily: 'Poppins', color: isTop ? '#367DFF' : '#6B7490' }}
          >
            {pct}%
          </Text>
        </View>
        <Text className="text-sm text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
          {currencySymbol}{formatNum(item.total)}
        </Text>
      </View>
      <View className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#0C111F]">
        <Animated.View
          className="h-2 rounded-full"
          style={{
            width: animWidth,
            backgroundColor: '#367DFF',
          }}
        />
      </View>
    </View>
  );
}

// ── Recent expense row ───────────────────────────────────────────────

function ExpenseRow({
  expense,
  currencySymbol,
}: {
  expense: RecentExpense;
  currencySymbol: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-[#1F2740]">
      <View className="flex-row items-center gap-3 flex-1">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#0C111F]">
          <CostIcon size={16} color="#A3ACBF" />
        </View>
        <View className="flex-1">
          <Text
            className="text-sm text-white"
            style={{ fontFamily: 'Poppins-SemiBold' }}
            numberOfLines={1}
          >
            {expense.logTypeName}
          </Text>
          <Text className="text-[12px] pt-0.5 text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
            {expense.categoryName} {'\u00B7'} {relativeDate(expense.date)}
          </Text>
        </View>
      </View>
      <Text
        className="ml-3 text-[14px] text-white"
        style={{ fontFamily: 'Poppins-SemiBold' }}
      >
        {currencySymbol}{formatNum(expense.amount)}
      </Text>
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function formatNum(n: number): string {
  return n % 1 === 0
    ? Math.round(n).toLocaleString('en-US')
    : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function relativeDate(dateStr: string): string {
  if (!dateStr) return '';
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}

// ── Screen ───────────────────────────────────────────────────────────

export function SpendingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { data, loading, error, retry } = useVehicleData();
  const { plan } = useEntitlement();
  const { currencySymbol } = useCurrency(data?.device.currency_code);

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [pickerOpen, setPickerOpen] = useState(false);

  const progress = useAnimatedProgress(selectedYear);

  const yearData = useYearScopedData(
    data?.userLogs ?? [],
    data?.logTypes ?? [],
    data?.categories ?? [],
    selectedYear,
  );

  const isSubscriber = plan !== 'free';

  const yearInsight = useMemo(() => {
    if (yearData.yearTotal === 0) return `No data for ${selectedYear}.`;
    const top = yearData.topCategory;
    if (yearData.isCurrentYear) {
      if (yearData.thisMonth && yearData.thisMonth.total > 0 && top) {
        return `You spent ${formatAmount(yearData.thisMonth.total, currencySymbol)} this month - mostly on ${top.categoryName}.`;
      }
      if (yearData.yearTotal > 0) {
        return `You've spent ${formatAmount(yearData.yearTotal, currencySymbol)} on maintenance this year.`;
      }
    }
    if (top) {
      return `You spent ${formatAmount(yearData.yearTotal, currencySymbol)} in ${selectedYear} - mostly on ${top.categoryName}.`;
    }
    return `You spent ${formatAmount(yearData.yearTotal, currencySymbol)} in ${selectedYear}.`;
  }, [yearData, selectedYear, currencySymbol]);

  if (loading && !data) return <LoadingState />;
  if (error && !data) return <ErrorState message={error} onRetry={retry} />;

  const breakdownTotal = yearData.breakdown.reduce((s, c) => s + c.total, 0);

  return (
    <View className="flex-1 bg-[#0C111F]">
      <BottomSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Select Year"
      >
        {YEAR_OPTIONS.map((y) => (
          <BottomSheetOption
            key={y}
            label={`${y}${y === CURRENT_YEAR ? ' (current)' : ''}`}
            onPress={() => {
              setSelectedYear(y);
              setPickerOpen(false);
            }}
          />
        ))}
      </BottomSheet>

      {!isSubscriber ? (
        <>
          <Pressable
            onPress={() => navigation.goBack()}
            className="absolute z-10 rounded-full bg-black/40 p-2"
            style={{ top: insets.top + 8, left: 16 }}
            hitSlop={8}
          >
            <BackArrowIcon size={24} />
          </Pressable>

          <View
            style={{
              paddingTop: insets.top + 46,
              paddingHorizontal: 16,
              flex: 1,
              justifyContent: 'flex-start',
            }}
          >
            <Text
              className="text-[28px] text-white"
              style={{ fontFamily: 'Poppins-ExtraBold' }}
            >
              Spending
            </Text>
            <View className="flex-1 items-center px-8" style={{ justifyContent: 'flex-start', paddingTop: 56 }}>
              <Image
                source={require('../../../assets/spending_sub.png')}
                style={{ width: '100%', height: '50%' }}
                resizeMode="contain"
              />
              <Text
                className="mt-6 text-center text-xl text-white"
                style={{ fontFamily: 'Poppins-Bold' }}
              >
                See where your car money goes
              </Text>
              <Text
                className="mt-3 text-center text-sm text-[#A3ACBF]"
                style={{ fontFamily: 'Poppins' }}
              >
                Unlock monthly spending, category breakdowns, and maintenance trends.
              </Text>
              <View className="mt-6 w-full">
                <PrimaryButton label="Upgrade" onPress={() => navigation.navigate(routes.paywall)} />
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
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
        contentContainerStyle={{
          paddingTop: insets.top + 46,
          paddingHorizontal: 16,
          paddingBottom: 32,
        }}
      >
        <Text
          className="text-[28px] text-white"
          style={{ fontFamily: 'Poppins-ExtraBold' }}
        >
          Spending
        </Text>

        {data ? (
          <View style={{ gap: 13, marginTop: 4 }}>
            <Text
              className="text-sm text-[#A3ACBF]"
              style={{ fontFamily: 'Poppins' }}
            >
              {yearInsight}
            </Text>

            {/* Chart card with year selector */}
            <ContentCard>
              <View className="flex-row items-center justify-between mb-4">
                <Text
                  className="text-base text-white"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Monthly Spending
                </Text>
                <Pressable
                  onPress={() => setPickerOpen(true)}
                  className="flex-row items-center gap-1"
                  hitSlop={12}
                >
                  <Text
                    className="text-base text-white"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    {selectedYear}
                  </Text>
                  <ChevronDownIcon size={14} color="#A3ACBF" />
                </Pressable>
              </View>
              <YearBarChart
                data={yearData.monthlyTotals}
                currencySymbol={currencySymbol}
                progress={progress}
              />
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

            {/* Top category */}
            {yearData.topCategory ? (
              <ContentCard>
                <View className="flex-row items-center gap-3">
                  {yearData.topCategory.iconUrl ? (
                    <Image
                      source={{ uri: yearData.topCategory.iconUrl }}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-[#0C111F]">
                      <Text className="text-[10px] font-bold text-[#A3ACBF]">
                        {yearData.topCategory.categoryName.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-[12px] text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
                      Top Category
                    </Text>
                    <Text
                      className="text-lg text-white"
                      style={{ fontFamily: 'Poppins-Bold' }}
                    >
                      {yearData.topCategory.categoryName}
                    </Text>
                    <Text className="text-[12px] text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
                      {formatAmount(yearData.topCategory.total, currencySymbol)} total
                    </Text>
                  </View>
                </View>
              </ContentCard>
            ) : null}

            {/* Category breakdown */}
            {yearData.breakdown.length > 0 ? (
              <ContentCard>
                <Text
                  className="text-base text-white"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Category Breakdown
                </Text>
                {yearData.breakdown.map((cat, idx) => (
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
            ) : null}

            {/* Recent expenses */}
            {yearData.recent.length > 0 ? (
              <ContentCard>
                <Text
                  className="mb-1 text-base text-white"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Recent Expenses
                </Text>
                {yearData.recent.map((exp) => (
                  <ExpenseRow
                    key={exp.logId}
                    expense={exp}
                    currencySymbol={currencySymbol}
                  />
                ))}
              </ContentCard>
            ) : null}

            {/* Empty state */}
            {yearData.yearTotal === 0 ? (
              <ContentCard>
                <Text className="text-center text-sm text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
                  No spending data for {selectedYear}. Add costs to your maintenance logs to see analytics here.
                </Text>
              </ContentCard>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
        </>
      )}
    </View>
  );
}
