export type MasteryStatus = 'Unstarted' | 'Beginner' | 'Learning' | 'Mastered';

export type MasteryDisplayKind = 'unstarted' | 'beginner' | 'learning' | 'mastered';

const MAX_MASTERY_SCORE = 10;

function clampMasteryScore(score: number | undefined): number {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return 0;
  }
  return Math.min(MAX_MASTERY_SCORE, Math.max(0, score));
}

export function getMasteryStatus(score?: number): MasteryStatus {
  const s = clampMasteryScore(score);
  if (s === 0) {
    return 'Unstarted';
  }
  if (s < 4) {
    return 'Beginner';
  }
  if (s < 8) {
    return 'Learning';
  }
  return 'Mastered';
}

export function getMasteryStatusFromStats(
  averageMastery: number | null | undefined,
  vocabCount: number | undefined,
): MasteryStatus {
  if (typeof vocabCount === 'number' && vocabCount === 0) {
    return 'Unstarted';
  }
  return getMasteryStatus(averageMastery ?? 0);
}

export function getMasteryDisplay(score?: number): { label: MasteryStatus; kind: MasteryDisplayKind } {
  const status = getMasteryStatus(score);
  const map: Record<MasteryStatus, { label: MasteryStatus; kind: MasteryDisplayKind }> = {
    Unstarted: { label: 'Unstarted', kind: 'unstarted' },
    Beginner: { label: 'Beginner', kind: 'beginner' },
    Learning: { label: 'Learning', kind: 'learning' },
    Mastered: { label: 'Mastered', kind: 'mastered' },
  };
  return map[status];
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
  const s = clampMasteryScore(score);
  return (s / MAX_MASTERY_SCORE) * 100;
}
