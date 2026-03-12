import type { MaintenanceStatusVariant } from '@/types/maintenance';

type SortableItem = {
  status: { variant: MaintenanceStatusVariant };
  remainingValue?: number;
  name: string;
};

/** Business-logic.md §9 priority: overdue → warning → normal → neutral. */
const PRIORITY: Record<MaintenanceStatusVariant, number> = {
  overdue: 0,
  warning: 1,
  normal: 2,
  neutral: 3,
};

/**
 * Sorts maintenance items by due-status priority, then by
 * smallest remaining value, then alphabetically by name.
 */
export function sortMaintenanceItemsByPriority<T extends SortableItem>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const pa = PRIORITY[a.status.variant];
    const pb = PRIORITY[b.status.variant];
    if (pa !== pb) return pa - pb;

    const ra = a.remainingValue ?? Infinity;
    const rb = b.remainingValue ?? Infinity;
    if (ra !== rb) return ra - rb;

    return a.name.localeCompare(b.name);
  });
}
