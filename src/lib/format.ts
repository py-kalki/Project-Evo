/**
 * format.ts — display helpers for prices and dates.
 * All formatting happens here; the API and DB always store raw values.
 */

/**
 * Format an integer rupee price for display.
 * 0 → "Free"
 * 1500 → "₹1,500"
 * 150000 → "₹1,50,000"
 */
export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format a UTC Date/ISO string to a friendly IST string.
 * Example: "Sat, 18 Oct, 6:30 PM"
 */
export function formatEventDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })
    .format(d)
    .replace(',', ',') // keep the comma after weekday
    .replace(' am', ' AM')
    .replace(' pm', ' PM');
}

/**
 * Display label for a category enum value.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  MUSIC: 'Music',
  WORKSHOP: 'Workshop',
  FOOD: 'Food',
  SPORTS: 'Sports',
  KIDS: 'Kids',
};
