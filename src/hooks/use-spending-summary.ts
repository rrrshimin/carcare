import { useMemo } from 'react';

import type { VehicleScreenData } from '@/hooks/use-vehicle-data';
import {
  computeCategoryBreakdown,
  computeSpendingSummary,
  computeThisMonthSpending,
  computeThisYearSpending,
  type SpendingSummary,
} from '@/utils/calculations/spending-analytics';

// ── Shared formatting ────────────────────────────────────────────────

export function formatAmount(value: number, symbol: string): string {
  const rounded = Math.round(value * 100) / 100;
  const str = rounded % 1 === 0
    ? Math.round(rounded).toLocaleString('en-US')
    : rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${str}`;
}

// ── Home-row subtitle ────────────────────────────────────────────────

export type SpendingRowSummary = {
  line1: string;
  line2: string | null;
  hasData: boolean;
};

/**
 * Derives two subtitle lines for the Spending home-row card.
 * line1: month spending or top category or fallback
 * line2: year total (when there is month or year data)
 */
export function useSpendingRowSummary(
  data: VehicleScreenData | null,
  currencySymbol: string,
  isSubscriber: boolean,
): SpendingRowSummary {
  const placeholder: SpendingRowSummary = { line1: 'Track your spending and', line2: 'maintenance analytics', hasData: false };

  return useMemo(() => {
    if (!isSubscriber) return placeholder;
    if (!data) return placeholder;

    const month = computeThisMonthSpending(data.userLogs);
    const year = computeThisYearSpending(data.userLogs);

    const yearLine = year.total > 0
      ? `${formatAmount(year.total, currencySymbol)} this year in total`
      : null;

    if (month.total > 0) {
      const formatted = formatAmount(month.total, currencySymbol);
      const svc = month.count === 1 ? 'service' : 'services';
      return {
        line1: `${formatted} this month across ${month.count} ${svc}`,
        line2: yearLine,
        hasData: true,
      };
    }

    const yearCats = computeCategoryBreakdown(
      data.userLogs, data.logTypes, data.categories,
    );
    if (yearCats.length > 0) {
      return {
        line1: `Most spent on ${yearCats[0].categoryName} this year`,
        line2: yearLine,
        hasData: true,
      };
    }

    if (year.total > 0) {
      return {
        line1: `${formatAmount(year.total, currencySymbol)} spent this year`,
        line2: null,
        hasData: true,
      };
    }

    return placeholder;
  }, [data, currencySymbol, isSubscriber]);
}

// ── Full analytics (Spending screen) ─────────────────────────────────

export function useSpendingAnalytics(
  data: VehicleScreenData | null,
): SpendingSummary | null {
  return useMemo(() => {
    if (!data) return null;
    return computeSpendingSummary(data.userLogs, data.logTypes, data.categories);
  }, [data]);
}

// ── Insight sentence (Spending screen header) ────────────────────────

/**
 * Returns a one-line contextual sentence displayed above the chart.
 * Priority:
 *   1. month has spending + top month category → "You spent $X this month — mostly on {cat}."
 *   2. year has spending → "You've spent $X on maintenance this year."
 *   3. fallback → "Track what your car costs over time."
 */
export function getInsightSentence(
  analytics: SpendingSummary,
  currencySymbol: string,
): string {
  if (analytics.thisMonth > 0 && analytics.topMonthCategory) {
    const amt = formatAmount(analytics.thisMonth, currencySymbol);
    return `You spent ${amt} this month - mostly on ${analytics.topMonthCategory.categoryName}.`;
  }

  if (analytics.thisYear > 0) {
    const amt = formatAmount(analytics.thisYear, currencySymbol);
    return `You've spent ${amt} on maintenance this year.`;
  }

  return 'Track what your car costs over time.';
}
