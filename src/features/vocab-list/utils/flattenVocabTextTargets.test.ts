import type { TVocab } from '@/types/vocab-list';
import { describe, expect, it } from 'vitest';
import { flattenVocabTextTargets } from './flattenVocabTextTargets';

function vocab(id: string, targets: string[]): TVocab {
  return { id, textTargets: targets.map(textTarget => ({ textTarget })) } as unknown as TVocab;
}

describe('flattenVocabTextTargets', () => {
  it('emits one placeholder row for a vocab without text targets', () => {
    const [row] = flattenVocabTextTargets([vocab('v1', [])]);
    expect(row).toMatchObject({ id: 'v1::empty', textTarget: null, isGroupStart: true, groupSize: 1 });
  });

  it('emits one row per text target with group metadata', () => {
    const rows = flattenVocabTextTargets([vocab('v1', ['a', 'b', 'c'])]);
    expect(rows.map(r => r.id)).toEqual(['v1::0', 'v1::1', 'v1::2']);
    expect(rows.map(r => r.isGroupStart)).toEqual([true, false, false]);
    expect(rows.every(r => r.groupSize === 3)).toBe(true);
  });

  it('keeps vocab order and restarts groups per vocab', () => {
    const rows = flattenVocabTextTargets([vocab('v1', ['a']), vocab('v2', ['b', 'c'])]);
    expect(rows.map(r => r.id)).toEqual(['v1::0', 'v2::0', 'v2::1']);
    expect(rows.map(r => r.isGroupStart)).toEqual([true, true, false]);
  });

  it('returns an empty list for no vocabs', () => {
    expect(flattenVocabTextTargets([])).toEqual([]);
  });
});
