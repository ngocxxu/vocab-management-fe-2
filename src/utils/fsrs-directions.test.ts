import { describe, expect, it } from 'vitest';
import { EFsrsDirection } from '@/enum/vocab-trainer';
import { toggleDirection } from './fsrs-directions';

const S2T = EFsrsDirection.SOURCE_TO_TARGET;
const T2S = EFsrsDirection.TARGET_TO_SOURCE;
const RANDOM = EFsrsDirection.RANDOM;

describe('toggleDirection', () => {
  it('picking Random clears Recognise and Recall', () => {
    expect(toggleDirection([S2T, T2S], RANDOM)).toEqual([RANDOM]);
  });

  it('picking Recognise or Recall clears Random', () => {
    expect(toggleDirection([RANDOM], S2T)).toEqual([S2T]);
    expect(toggleDirection([RANDOM], T2S)).toEqual([T2S]);
  });

  it('picking the second of Recognise and Recall keeps both', () => {
    expect(toggleDirection([S2T], T2S)).toEqual([S2T, T2S]);
  });

  it('unpicking one of Recognise and Recall keeps the other', () => {
    expect(toggleDirection([S2T, T2S], S2T)).toEqual([T2S]);
  });

  it('the last selected direction cannot be unpicked', () => {
    expect(toggleDirection([RANDOM], RANDOM)).toEqual([RANDOM]);
    expect(toggleDirection([S2T], S2T)).toEqual([S2T]);
  });
});
