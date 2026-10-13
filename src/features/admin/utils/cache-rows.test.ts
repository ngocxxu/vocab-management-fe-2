import { describe, expect, it } from 'vitest';
import { toCacheRows } from './cache-rows';

describe('toCacheRows', () => {
  it('lists each key prefix with its count in alphabetical order', () => {
    const rows = toCacheRows({ 'vocab:': 4, 'cache:': 12, 'session:': 1 });

    expect(rows).toEqual([
      { prefix: 'cache:', count: 12 },
      { prefix: 'session:', count: 1 },
      { prefix: 'vocab:', count: 4 },
    ]);
  });

  it('keeps a prefix with a zero count so the admin sees it is empty', () => {
    expect(toCacheRows({ 'chat:': 0 })).toEqual([{ prefix: 'chat:', count: 0 }]);
  });

  it('returns no rows when the stats are empty', () => {
    expect(toCacheRows({})).toEqual([]);
  });
});
