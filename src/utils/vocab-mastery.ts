export type MasteryLevel = 'New' | 'Difficult' | 'Learning' | 'Mastered';

export type MasteryDisplayKind = 'unstarted' | 'beginner' | 'learning' | 'mastered';

export function getMasteryLevel(score?: number): MasteryLevel {
  if (score == null || score === 0) {
    return 'New';
  }
  if (score < 50) {
    return 'Difficult';
  }
  if (score < 80) {
    return 'Learning';
  }
  return 'Mastered';
}

export function getMasteryDisplay(score?: number): { label: string; kind: MasteryDisplayKind } {
  const level = getMasteryLevel(score);
  const map: Record<MasteryLevel, { label: string; kind: MasteryDisplayKind }> = {
    New: { label: 'Unstarted', kind: 'unstarted' },
    Difficult: { label: 'Beginner', kind: 'beginner' },
    Learning: { label: 'Learning', kind: 'learning' },
    Mastered: { label: 'Mastered', kind: 'mastered' },
  };
  return map[level];
}

export function getMasteryColors(kind: MasteryDisplayKind): {
  pill: string;
  progress: string;
  track: string;
} {
  const map: Record<MasteryDisplayKind, { pill: string; progress: string; track: string }> = {
    unstarted: {
      pill: 'bg-red-500 text-white dark:bg-red-700 dark:text-white',
      progress: 'stroke-red-500 dark:stroke-red-700',
      track: 'stroke-slate-200 dark:stroke-slate-700',
    },
    beginner: {
      pill: 'bg-orange-500 text-white dark:bg-orange-700 dark:text-white',
      progress: 'stroke-orange-500 dark:stroke-orange-700',
      track: 'stroke-slate-200 dark:stroke-slate-700',
    },
    learning: {
      pill: 'bg-blue-500 text-white dark:bg-blue-700 dark:text-white',
      progress: 'stroke-blue-500 dark:stroke-blue-700',
      track: 'stroke-slate-200 dark:stroke-slate-700',
    },
    mastered: {
      pill: 'bg-green-500 text-white dark:bg-green-700 dark:text-white',
      progress: 'stroke-green-500 dark:stroke-green-700',
      track: 'stroke-slate-200 dark:stroke-slate-700',
    },
  };
  return map[kind];
}

export function clampMasteryPercent(score: number | undefined = 0): number {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return 0;
  }
  return Math.min(100, Math.max(0, score));
}
