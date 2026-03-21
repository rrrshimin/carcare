import type { UserLogRow } from '@/services/api/user-log-api';
import type { LogTypeRow } from '@/services/api/log-type-api';
import type { LogCategoryRow } from '@/services/api/category-api';

// ── Types ────────────────────────────────────────────────────────────

export type MonthlyTotal = {
  /** YYYY-MM */
  month: string;
  label: string;
  total: number;
};

export type CategoryTotal = {
  categoryId: number;
  categoryName: string;
  iconUrl: string | null;
  total: number;
};

export type RecentExpense = {
  logId: number;
  logTypeName: string;
  categoryName: string;
  amount: number;
  date: string;
};

export type SpendingSummary = {
  thisMonth: number;
  thisMonthCount: number;
  thisYear: number;
  thisYearCount: number;
  monthlyTotals: MonthlyTotal[];
  topCategory: CategoryTotal | null;
  /** Top category for the current month only (for insight sentence). */
  topMonthCategory: CategoryTotal | null;
  categoryBreakdown: CategoryTotal[];
  recentExpenses: RecentExpense[];
};

// ── Helpers ──────────────────────────────────────────────────────────

function getCostedLogs(logs: UserLogRow[]): UserLogRow[] {
  return logs.filter(
    (l) => l.cost_amount != null && l.cost_amount > 0 && l.change_date,
  );
}

function parseMonth(dateStr: string): string {
  return dateStr.substring(0, 7);
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function monthLabel(yyyyMm: string): string {
  const parts = yyyyMm.split('-');
  const monthIndex = parseInt(parts[1], 10) - 1;
  return MONTH_LABELS[monthIndex] ?? yyyyMm;
}

// ── Public aggregation functions ─────────────────────────────────────

/**
 * Computes monthly totals for all 12 months of a given year.
 * Future months in the current year return 0.
 */
export function computeYearMonthlyTotals(
  logs: UserLogRow[],
  year: number,
): MonthlyTotal[] {
  const costed = getCostedLogs(logs);
  const yearStr = String(year);

  const months: string[] = [];
  for (let m = 1; m <= 12; m++) {
    months.push(`${yearStr}-${String(m).padStart(2, '0')}`);
  }

  const sums = new Map<string, number>();
  for (const key of months) sums.set(key, 0);

  for (const log of costed) {
    const key = parseMonth(log.change_date!);
    if (sums.has(key)) {
      sums.set(key, sums.get(key)! + log.cost_amount!);
    }
  }

  return months.map((m) => ({
    month: m,
    label: monthLabel(m),
    total: Math.round((sums.get(m) ?? 0) * 100) / 100,
  }));
}

export function computeMonthlyTotals(
  logs: UserLogRow[],
  monthCount: number = 6,
): MonthlyTotal[] {
  const costed = getCostedLogs(logs);

  const now = new Date();
  const months: string[] = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(key);
  }

  const sums = new Map<string, number>();
  for (const m of months) sums.set(m, 0);

  for (const log of costed) {
    const key = parseMonth(log.change_date!);
    if (sums.has(key)) {
      sums.set(key, sums.get(key)! + log.cost_amount!);
    }
  }

  return months.map((m) => ({
    month: m,
    label: monthLabel(m),
    total: Math.round((sums.get(m) ?? 0) * 100) / 100,
  }));
}

export function computeThisMonthSpending(logs: UserLogRow[]): {
  total: number;
  count: number;
} {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const costed = getCostedLogs(logs);
  let total = 0;
  let count = 0;
  for (const log of costed) {
    if (parseMonth(log.change_date!) === currentMonth) {
      total += log.cost_amount!;
      count++;
    }
  }
  return { total: Math.round(total * 100) / 100, count };
}

export function computeThisYearSpending(logs: UserLogRow[]): {
  total: number;
  count: number;
} {
  return computeYearSpending(logs, new Date().getFullYear());
}

/**
 * Total spending and log count for a specific year.
 */
export function computeYearSpending(logs: UserLogRow[], year: number): {
  total: number;
  count: number;
} {
  const yearStr = String(year);
  const costed = getCostedLogs(logs);
  let total = 0;
  let count = 0;
  for (const log of costed) {
    if (log.change_date!.startsWith(yearStr)) {
      total += log.cost_amount!;
      count++;
    }
  }
  return { total: Math.round(total * 100) / 100, count };
}

export function computeCategoryBreakdown(
  logs: UserLogRow[],
  logTypes: LogTypeRow[],
  categories: LogCategoryRow[],
): CategoryTotal[] {
  const costed = getCostedLogs(logs);

  const logTypeToCategory = new Map<number, number>();
  for (const lt of logTypes) {
    if (lt.category_link != null) {
      logTypeToCategory.set(lt.id, lt.category_link);
    }
  }

  const categoryInfo = new Map<number, { name: string; iconUrl: string | null }>();
  for (const c of categories) {
    categoryInfo.set(c.id, { name: c.category_name ?? 'Other', iconUrl: c.image_url ?? null });
  }

  const sums = new Map<number, number>();
  for (const log of costed) {
    const catId = logTypeToCategory.get(log.log_type ?? -1);
    if (catId == null) continue;
    sums.set(catId, (sums.get(catId) ?? 0) + log.cost_amount!);
  }

  return Array.from(sums.entries())
    .map(([catId, total]) => {
      const info = categoryInfo.get(catId);
      return {
        categoryId: catId,
        categoryName: info?.name ?? 'Other',
        iconUrl: info?.iconUrl ?? null,
        total: Math.round(total * 100) / 100,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function computeRecentExpenses(
  logs: UserLogRow[],
  logTypes: LogTypeRow[],
  categories: LogCategoryRow[],
  limit: number = 5,
): RecentExpense[] {
  const costed = getCostedLogs(logs);

  const logTypeMap = new Map<number, LogTypeRow>();
  for (const lt of logTypes) logTypeMap.set(lt.id, lt);

  const categoryMap = new Map<number, string>();
  for (const c of categories) categoryMap.set(c.id, c.category_name ?? 'Other');

  return costed
    .sort((a, b) => (b.change_date ?? '').localeCompare(a.change_date ?? ''))
    .slice(0, limit)
    .map((log) => {
      const lt = logTypeMap.get(log.log_type ?? -1);
      const catName = lt?.category_link
        ? categoryMap.get(lt.category_link) ?? 'Other'
        : 'Other';
      return {
        logId: log.id,
        logTypeName: lt?.log_type_name ?? 'Service',
        categoryName: catName,
        amount: log.cost_amount!,
        date: log.change_date ?? '',
      };
    });
}

/**
 * Category breakdown scoped to a specific year.
 */
export function computeYearCategoryBreakdown(
  logs: UserLogRow[],
  logTypes: LogTypeRow[],
  categories: LogCategoryRow[],
  year: number,
): CategoryTotal[] {
  const yearStr = String(year);
  const yearLogs = getCostedLogs(logs).filter(
    (l) => l.change_date!.startsWith(yearStr),
  );
  if (yearLogs.length === 0) return [];

  const logTypeToCategory = new Map<number, number>();
  for (const lt of logTypes) {
    if (lt.category_link != null) logTypeToCategory.set(lt.id, lt.category_link);
  }

  const categoryInfo = new Map<number, { name: string; iconUrl: string | null }>();
  for (const c of categories) {
    categoryInfo.set(c.id, { name: c.category_name ?? 'Other', iconUrl: c.image_url ?? null });
  }

  const sums = new Map<number, number>();
  for (const log of yearLogs) {
    const catId = logTypeToCategory.get(log.log_type ?? -1);
    if (catId == null) continue;
    sums.set(catId, (sums.get(catId) ?? 0) + log.cost_amount!);
  }

  return Array.from(sums.entries())
    .map(([catId, total]) => {
      const info = categoryInfo.get(catId);
      return {
        categoryId: catId,
        categoryName: info?.name ?? 'Other',
        iconUrl: info?.iconUrl ?? null,
        total: Math.round(total * 100) / 100,
      };
    })
    .sort((a, b) => b.total - a.total);
}

/**
 * Recent expenses scoped to a specific year.
 */
export function computeYearRecentExpenses(
  logs: UserLogRow[],
  logTypes: LogTypeRow[],
  categories: LogCategoryRow[],
  year: number,
  limit: number = 5,
): RecentExpense[] {
  const yearStr = String(year);
  const yearLogs = getCostedLogs(logs).filter(
    (l) => l.change_date!.startsWith(yearStr),
  );

  const logTypeMap = new Map<number, LogTypeRow>();
  for (const lt of logTypes) logTypeMap.set(lt.id, lt);

  const categoryMap = new Map<number, string>();
  for (const c of categories) categoryMap.set(c.id, c.category_name ?? 'Other');

  return yearLogs
    .sort((a, b) => (b.change_date ?? '').localeCompare(a.change_date ?? ''))
    .slice(0, limit)
    .map((log) => {
      const lt = logTypeMap.get(log.log_type ?? -1);
      const catName = lt?.category_link
        ? categoryMap.get(lt.category_link) ?? 'Other'
        : 'Other';
      return {
        logId: log.id,
        logTypeName: lt?.log_type_name ?? 'Service',
        categoryName: catName,
        amount: log.cost_amount!,
        date: log.change_date ?? '',
      };
    });
}

/**
 * Category breakdown scoped to the current calendar month.
 * Used for the "mostly on {category}" insight sentence.
 */
export function computeCurrentMonthCategoryBreakdown(
  logs: UserLogRow[],
  logTypes: LogTypeRow[],
  categories: LogCategoryRow[],
): CategoryTotal[] {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLogs = getCostedLogs(logs).filter(
    (l) => parseMonth(l.change_date!) === currentMonth,
  );
  if (monthLogs.length === 0) return [];

  const logTypeToCategory = new Map<number, number>();
  for (const lt of logTypes) {
    if (lt.category_link != null) logTypeToCategory.set(lt.id, lt.category_link);
  }

  const categoryInfo = new Map<number, { name: string; iconUrl: string | null }>();
  for (const c of categories) {
    categoryInfo.set(c.id, { name: c.category_name ?? 'Other', iconUrl: c.image_url ?? null });
  }

  const sums = new Map<number, number>();
  for (const log of monthLogs) {
    const catId = logTypeToCategory.get(log.log_type ?? -1);
    if (catId == null) continue;
    sums.set(catId, (sums.get(catId) ?? 0) + log.cost_amount!);
  }

  return Array.from(sums.entries())
    .map(([catId, total]) => {
      const info = categoryInfo.get(catId);
      return {
        categoryId: catId,
        categoryName: info?.name ?? 'Other',
        iconUrl: info?.iconUrl ?? null,
        total: Math.round(total * 100) / 100,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function computeSpendingSummary(
  logs: UserLogRow[],
  logTypes: LogTypeRow[],
  categories: LogCategoryRow[],
): SpendingSummary {
  const thisMonth = computeThisMonthSpending(logs);
  const thisYear = computeThisYearSpending(logs);
  const monthlyTotals = computeMonthlyTotals(logs, 6);
  const categoryBreakdown = computeCategoryBreakdown(logs, logTypes, categories);
  const recentExpenses = computeRecentExpenses(logs, logTypes, categories);
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  const monthCats = computeCurrentMonthCategoryBreakdown(logs, logTypes, categories);
  const topMonthCategory = monthCats.length > 0 ? monthCats[0] : null;

  return {
    thisMonth: thisMonth.total,
    thisMonthCount: thisMonth.count,
    thisYear: thisYear.total,
    thisYearCount: thisYear.count,
    monthlyTotals,
    topCategory,
    topMonthCategory,
    categoryBreakdown,
    recentExpenses,
  };
}
