import type { TMasterySummary } from '@/types/statistics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCount } from '../types';
import { ClockCircle, MedalRibbon } from '@solar-icons/react/ssr';
import Link from 'next/link';

type TFsrsSummaryCardProps = {
  summary: Pick<TMasterySummary, 'fsrsDueToday' | 'fsrsMastered'>;
};

/** Spaced repetition has its own numbers: they never mix into the mastery score above. */
export function FsrsSummaryCard({ summary }: TFsrsSummaryCardProps) {
  const { fsrsDueToday, fsrsMastered } = summary;

  // Someone who never used spaced repetition sees nothing here, so the dashboard stays as it was.
  if (!(fsrsDueToday > 0) && !(fsrsMastered > 0)) {
    return null;
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 shadow-sm">
      <CardContent className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold text-muted-foreground sm:text-xl">Spaced repetition</p>
          <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
            <p className="flex items-center gap-2">
              <ClockCircle size={24} weight="BoldDuotone" className="text-primary" />
              <span className="text-3xl font-bold text-foreground">{formatCount(fsrsDueToday)}</span>
              <span className="text-muted-foreground">due today</span>
            </p>
            <p className="flex items-center gap-2">
              <MedalRibbon size={24} weight="BoldDuotone" className="text-success" />
              <span className="text-3xl font-bold text-foreground">{formatCount(fsrsMastered)}</span>
              <span className="text-muted-foreground">mastered</span>
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/vocab-trainer">{fsrsDueToday > 0 ? 'Review now' : 'Open trainers'}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
