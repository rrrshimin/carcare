/**
 * Parses a date string into a local Date, avoiding the UTC-midnight
 * pitfall for date-only strings like "2024-12-18".
 */
function parseLocalDate(iso: string): Date {
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnlyPattern.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(iso);
}

/**
 * Formats an ISO date string for display in history rows / read-only contexts.
 * Output example: "18 Dec 2024"
 */
export function formatDate(iso: string): string {
  const d = parseLocalDate(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats a Date object for display in date picker triggers.
 * Output example: "18/12/2024"
 */
export function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
