import type { TCacheRow, TCacheStats } from '@/types/admin';

/** One row per key prefix, sorted by prefix so the table reads the same on every load. */
export function toCacheRows(stats: TCacheStats): TCacheRow[] {
  return Object.entries(stats)
    .map(([prefix, count]) => ({ prefix, count }))
    .sort((a, b) => a.prefix.localeCompare(b.prefix));
}
