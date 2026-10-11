import type { TMasterySummary } from '@/types/statistics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCount } from '../types';
import { ClockCircle, MedalRibbon } from '@solar-icons/react/ssr';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

type TFsrsSummaryCardProps = {
  summary: Pick<TMasterySummary, 'fsrsDueToday' | 'fsrsMastered'>;
};

/** Spaced repetition has its own numbers: they never mix into the mastery score above. */
export function FsrsSummaryCard({ summary }: TFsrsSummaryCardProps) {
  const t = useTranslations('dashboard.fsrs');
  const locale = useLocale();
  const { fsrsDueToday, fsrsMastered } = summary;

  // Someone who never used spaced repetition sees nothing here, so the dashboard stays as it was.
  if (!(fsrsDueToday > 0) && !(fsrsMastered > 0)) {
    return null;
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 shadow-sm">
      <CardContent className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold text-muted-foreground sm:text-xl">{t('title')}</p>
          <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
            <p className="flex items-center gap-2">
              <ClockCircle size={24} weight="BoldDuotone" className="text-primary" />
              <span className="text-3xl font-bold text-foreground">{formatCount(fsrsDueToday, locale)}</span>
              <span className="text-muted-foreground">{t('dueToday')}</span>
            </p>
            <p className="flex items-center gap-2">
              <MedalRibbon size={24} weight="BoldDuotone" className="text-success" />
              <span className="text-3xl font-bold text-foreground">{formatCount(fsrsMastered, locale)}</span>
              <span className="text-muted-foreground">{t('mastered')}</span>
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/vocab-trainer">{fsrsDueToday > 0 ? t('reviewNow') : t('openTrainers')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
