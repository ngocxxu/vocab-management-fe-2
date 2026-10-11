import type { TMasterySummary } from '@/types/statistics';

export type { TDashboardStatistics, TMasteryBySubject, TMasteryDistribution, TMasterySummary, TProgressOverTime, TTopProblematicVocab } from '@/types/statistics';

export function wordsNeedingReview(summary: TMasterySummary): number {
  return summary.criticalCount + summary.warningCount;
}

export function formatCount(value: number, locale: string): string {
  return value > 999 ? value.toLocaleString(locale) : String(value);
}
