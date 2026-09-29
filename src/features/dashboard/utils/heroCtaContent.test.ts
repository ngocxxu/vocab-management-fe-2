import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildHeroCtaContent, formatDaysBody } from './heroCtaContent';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-03-10T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('buildHeroCtaContent', () => {
  it('is critical when any critical vocab exist', () => {
    const result = buildHeroCtaContent({ criticalCount: 2, warningCount: 3, lastPracticeAt: null });
    expect(result.priority).toBe('critical');
    expect(result.totalNeedReview).toBe(5);
    expect(result.title).toEqual({ count: 5, rest: ' need your urgent review' });
    expect(result.badge.label).toBe('HIGH PRIORITY');
  });

  it('is warning when only warnings exist', () => {
    const result = buildHeroCtaContent({ criticalCount: 0, warningCount: 4, lastPracticeAt: null });
    expect(result.priority).toBe('warning');
    expect(result.title).toEqual({ count: 4, rest: ' need review' });
    expect(result.badge.label).toBe('NEEDS ATTENTION');
  });

  it('is on track with no count when nothing needs review', () => {
    const result = buildHeroCtaContent({ criticalCount: 0, warningCount: 0, lastPracticeAt: null });
    expect(result.priority).toBe('onTrack');
    expect(result.title.count).toBeNull();
    expect(result.badge.label).toBe('ALL GOOD');
  });

  it('reports noSessions when there was no practice', () => {
    expect(buildHeroCtaContent({ criticalCount: 0, warningCount: 0, lastPracticeAt: null }).body).toEqual({ kind: 'noSessions' });
  });

  it('reports days since the last practice', () => {
    const result = buildHeroCtaContent({ criticalCount: 1, warningCount: 0, lastPracticeAt: '2026-03-07T12:00:00Z' });
    expect(result.body).toEqual({ kind: 'daysSince', days: 3 });
  });

  it('never reports negative days for a future date', () => {
    const result = buildHeroCtaContent({ criticalCount: 1, warningCount: 0, lastPracticeAt: '2026-03-20T12:00:00Z' });
    expect(result.body).toEqual({ kind: 'daysSince', days: 0 });
  });
});

describe('formatDaysBody', () => {
  it('uses singular for one day and plural otherwise', () => {
    expect(formatDaysBody(1)).toContain('1 day since');
    expect(formatDaysBody(3)).toContain('3 days since');
    expect(formatDaysBody(0)).toContain('0 days since');
  });
});
