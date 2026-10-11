import type { TMasteryDistribution } from '@/types/statistics';

export type TDistributionGroup = 'low' | 'mid' | 'high';

export type TGroupedDistributionBar = {
  key: TDistributionGroup;
  labelKey: string;
  count: number;
  barClass: string;
};

function parseRangeStart(scoreRange: string): number {
  if (scoreRange === '0') {
    return 0;
  }
  const match = scoreRange.match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
}

function scoreRangeToGroup(scoreRange: string): TDistributionGroup {
  const start = parseRangeStart(scoreRange);
  if (start <= 3) {
    return 'low';
  }
  if (start <= 6) {
    return 'mid';
  }
  return 'high';
}

const GROUP_META: Record<TDistributionGroup, { labelKey: string; barClass: string }> = {
  low: { labelKey: 'distribution.low', barClass: 'bg-destructive' },
  mid: { labelKey: 'distribution.mid', barClass: 'bg-warning' },
  high: { labelKey: 'distribution.high', barClass: 'bg-success' },
};

export function groupDistributionBuckets(
  data: TMasteryDistribution[],
): TGroupedDistributionBar[] {
  const counts: Record<TDistributionGroup, number> = { low: 0, mid: 0, high: 0 };

  for (const item of data) {
    const group = scoreRangeToGroup(item.scoreRange);
    counts[group] += item.count;
  }

  return (['low', 'mid', 'high'] as const).map(key => ({
    key,
    labelKey: GROUP_META[key].labelKey,
    count: counts[key],
    barClass: GROUP_META[key].barClass,
  }));
}
