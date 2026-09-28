import { describe, expect, it } from 'vitest';
import { groupDistributionBuckets } from './groupDistributionBuckets';

describe('groupDistributionBuckets', () => {
  it('sums score ranges into low, mid and high', () => {
    const result = groupDistributionBuckets([
      { scoreRange: '0', count: 2 },
      { scoreRange: '1-3', count: 3 },
      { scoreRange: '4-6', count: 4 },
      { scoreRange: '7-10', count: 5 },
    ]);
    expect(result.map(r => [r.key, r.count])).toEqual([['low', 5], ['mid', 4], ['high', 5]]);
  });

  it('always returns the three groups in order, even for empty data', () => {
    const result = groupDistributionBuckets([]);
    expect(result.map(r => [r.key, r.count])).toEqual([['low', 0], ['mid', 0], ['high', 0]]);
  });

  it('puts the range boundaries in the right group', () => {
    const result = groupDistributionBuckets([
      { scoreRange: '3', count: 1 },
      { scoreRange: '4', count: 10 },
      { scoreRange: '6', count: 100 },
      { scoreRange: '7', count: 1000 },
    ]);
    expect(result.map(r => r.count)).toEqual([1, 110, 1000]);
  });

  it('treats an unparseable range as low', () => {
    expect(groupDistributionBuckets([{ scoreRange: 'n/a', count: 4 }])[0]?.count).toBe(4);
  });
});
