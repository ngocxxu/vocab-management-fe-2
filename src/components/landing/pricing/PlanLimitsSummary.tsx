import type { TPlan } from '@/types/plan';

function formatLimit(value: number, suffix: string): string {
  return value === -1 ? 'Unlimited' : `${value} ${suffix}`;
}

export function PlanLimitsSummary({ limits }: Readonly<{ limits: TPlan['limits'] }>) {
  const parts = [
    formatLimit(limits.vocabPerDay, 'vocabs/day'),
    formatLimit(limits.languageFolders, 'folders'),
    formatLimit(limits.subjects, 'subjects'),
  ];
  return (
    <p className="mt-1 font-sans text-xs text-muted-foreground">
      {parts.join(' · ')}
    </p>
  );
}
