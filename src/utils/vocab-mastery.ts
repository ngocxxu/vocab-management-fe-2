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
      pill: 'bg-muted text-muted-foreground',
      progress: 'stroke-muted-foreground',
      track: 'stroke-border',
    },
    beginner: {
      pill: 'bg-warning text-warning-foreground',
      progress: 'stroke-warning',
      track: 'stroke-border',
    },
    learning: {
      pill: 'bg-primary text-primary-foreground',
      progress: 'stroke-primary',
      track: 'stroke-border',
    },
    mastered: {
      pill: 'bg-success text-success-foreground',
      progress: 'stroke-success',
      track: 'stroke-border',
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
