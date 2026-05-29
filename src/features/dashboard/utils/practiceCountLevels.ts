export type TPracticeLevel = 0 | 1 | 2 | 3 | 4;

const LEVEL_THRESHOLDS = [
  { max: 0, level: 0 as const },
  { max: 2, level: 1 as const },
  { max: 5, level: 2 as const },
  { max: 10, level: 3 as const },
  { max: Number.POSITIVE_INFINITY, level: 4 as const },
] as const;

export function practiceCountToLevel(count: number): TPracticeLevel {
  const safeCount = Math.max(0, Math.floor(count));
  const match = LEVEL_THRESHOLDS.find(threshold => safeCount <= threshold.max);
  return match?.level ?? 0;
}
