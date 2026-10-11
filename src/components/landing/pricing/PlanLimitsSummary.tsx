import type { TPlan } from '@/types/plan';
import { useTranslations } from 'next-intl';

type LimitKey = 'vocabsPerDay' | 'folders' | 'subjects';

export function PlanLimitsSummary({ limits }: Readonly<{ limits: TPlan['limits'] }>) {
  const t = useTranslations('landing.plan');

  const formatLimit = (value: number, key: LimitKey): string =>
    value === -1 ? t('unlimited') : t(key, { value });

  const parts = [
    formatLimit(limits.vocabPerDay, 'vocabsPerDay'),
    formatLimit(limits.languageFolders, 'folders'),
    formatLimit(limits.subjects, 'subjects'),
  ];
  return (
    <p className="mt-1 font-sans text-xs text-muted-foreground">
      {parts.join(' · ')}
    </p>
  );
}
