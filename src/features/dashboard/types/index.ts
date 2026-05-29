import { formatDistanceToNow } from 'date-fns';

import type { TMasterySummary } from '@/types/statistics';

export type { TDashboardStatistics, TMasteryBySubject, TMasteryDistribution, TMasterySummary, TProgressOverTime, TTopProblematicVocab } from '@/types/statistics';

export function wordsNeedingReview(summary: TMasterySummary): number {
  return summary.criticalCount + summary.warningCount;
}

export function lastPracticedSubtitle(lastPracticeAt: string | null): string {
  if (!lastPracticeAt) {
    return 'No sessions yet. Start your first practice.';
  }
  return `Last practiced ${formatDistanceToNow(new Date(lastPracticeAt), { addSuffix: true })}`;
}

export function formatCount(value: number): string {
  return value > 999 ? value.toLocaleString() : String(value);
}
