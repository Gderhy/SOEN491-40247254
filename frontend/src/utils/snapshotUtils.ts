/**
 * Portfolio snapshot utilities
 * Helpers for filtering and labelling portfolio history snapshots.
 */

export interface Snapshot {
  date: string;          // 'YYYY-MM-DD'
  portfolio_value: number;
}

export type SnapshotRange = '1W' | '1M' | '3M' | '1Y' | 'ALL';

const RANGE_DAYS: Record<SnapshotRange, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
  ALL: Infinity,
};

/**
 * Filter a snapshot list to only entries within the selected time range.
 */
export function filterByRange(snapshots: Snapshot[], range: SnapshotRange): Snapshot[] {
  if (range === 'ALL') return snapshots;
  const cutoff = new Date(Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000);
  return snapshots.filter((s) => new Date(s.date) >= cutoff);
}

/**
 * Format a 'YYYY-MM-DD' date string for display on the chart X-axis.
 * Shorter ranges show day-level labels; longer ones show month + year.
 */
export function formatSnapshotDate(dateStr: string, range: SnapshotRange): string {
  const d = new Date(dateStr);
  if (range === '1W' || range === '1M') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}
