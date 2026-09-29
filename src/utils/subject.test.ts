import { describe, expect, it } from 'vitest';
import { getSubjectColor, getSubjectInitials, SUBJECT_COLORS } from '@/utils/subject';

describe('getSubjectInitials', () => {
  it('uses the first letter of the first two words', () => {
    expect(getSubjectInitials('machine learning')).toBe('ML');
    expect(getSubjectInitials('a b c')).toBe('AB');
  });

  it('uses the first two letters of a single word', () => {
    expect(getSubjectInitials('grammar')).toBe('GR');
  });

  it('ignores surrounding and repeated whitespace', () => {
    expect(getSubjectInitials('  data   science  ')).toBe('DS');
    expect(getSubjectInitials('  ab  ')).toBe('AB');
  });

  it('handles a one-letter name', () => {
    expect(getSubjectInitials('x')).toBe('X');
  });
});

describe('getSubjectColor', () => {
  it('returns the color at the index', () => {
    expect(getSubjectColor(0)).toBe(SUBJECT_COLORS[0]);
    expect(getSubjectColor(2)).toBe(SUBJECT_COLORS[2]);
  });

  it('wraps around past the palette length', () => {
    expect(getSubjectColor(SUBJECT_COLORS.length)).toBe(SUBJECT_COLORS[0]);
    expect(getSubjectColor(SUBJECT_COLORS.length + 1)).toBe(SUBJECT_COLORS[1]);
  });
});
