'use client';

import type { TFsrsReviewStats } from '@/types/vocab-trainer';
import { AltArrowLeft } from '@solar-icons/react/ssr';
import Link from 'next/link';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { directionLabel, formatPercent, formatShortDate } from '@/utils/fsrs-review';
import FsrsBarChart from './FsrsBarChart';

type FsrsStatsProps = Readonly<{
  trainerId: string;
  trainerName: string;
  stats: TFsrsReviewStats;
}>;

function Tile({ label, value, hint }: Readonly<{ label: string; value: string | number; hint: string }>) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

const FsrsStats: React.FC<FsrsStatsProps> = ({ trainerId, trainerName, stats }) => {
  const noReviewsYet = stats.cardsByState.review === 0 && stats.trueRetention.reviews === 0;
  const { trueRetention } = stats;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:py-10">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/vocab-trainer">
            <AltArrowLeft size={16} weight="BoldDuotone" className="mr-1" />
            Back to trainers
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{trainerName}</h1>
        <p className="text-muted-foreground">Spaced repetition statistics</p>
      </div>

      {stats.ended && (
        <Alert>
          <AlertTitle>This cycle has ended</AlertTitle>
          <AlertDescription>Nothing is scheduled anymore, so there is no forecast. Your progress is kept.</AlertDescription>
        </Alert>
      )}

      {noReviewsYet && !stats.ended && (
        <Alert>
          <AlertTitle>No reviews yet</AlertTitle>
          <AlertDescription>
            Your statistics appear after your first session.
            {' '}
            <Link href={`/vocab-trainer/${trainerId}/review`} className="font-medium text-primary underline">Start reviewing</Link>
          </AlertDescription>
        </Alert>
      )}

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Tile label="New" value={stats.cardsByState.new} hint="Questions not seen yet" />
        <Tile label="In review" value={stats.cardsByState.review} hint="Questions on a schedule" />
        <Tile label="Mastered" value={stats.mastered} hint="Remembered for about 6 months, no recent miss" />
        <Tile label="Leeches" value={stats.leeches} hint="Missed 8 times or more" />
        <Tile
          label="Retention"
          value={formatPercent(trueRetention.value)}
          hint={trueRetention.value === null ? 'No reviews yet' : `${trueRetention.reviews} reviews in ${trueRetention.windowDays} days`}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FsrsBarChart
          title="Next 30 days"
          description="Questions that come due each day. Overdue ones count on the first day."
          data={stats.forecast.map(day => ({ label: formatShortDate(day.date), count: day.count }))}
          ariaLabel="Questions due in each of the next 30 days"
          valueLabel="Due"
          emptyText={stats.ended ? 'The cycle has ended.' : 'Nothing is due in the next 30 days.'}
        />
        <FsrsBarChart
          title="How long you remember"
          description="Questions grouped by how long they stay in memory."
          data={stats.stabilityBuckets.map(bucket => ({ label: bucket.label, count: bucket.count }))}
          ariaLabel="Questions by memory stability"
          valueLabel="Questions"
          emptyText="Appears after your first reviews."
        />
      </div>

      <Card className="border-0 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-foreground">By direction</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">Direction</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Questions</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">New</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">In review</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Mastered</th>
                <th scope="col" className="py-2 pl-2 text-right font-medium">Leeches</th>
              </tr>
            </thead>
            <tbody>
              {stats.byDirection.map(row => (
                <tr key={row.direction} className="border-t border-border">
                  <th scope="row" className="py-2 pr-4 font-medium text-foreground">{directionLabel(row.direction)}</th>
                  <td className="px-2 py-2 text-right">{row.cards}</td>
                  <td className="px-2 py-2 text-right">{row.new}</td>
                  <td className="px-2 py-2 text-right">{row.review}</td>
                  <td className="px-2 py-2 text-right">{row.mastered}</td>
                  <td className="py-2 pl-2 text-right">{row.leeches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-0 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-foreground">Leeches</CardTitle>
          <p className="text-sm text-muted-foreground">Words you keep forgetting. A new example or a mnemonic often helps.</p>
        </CardHeader>
        <CardContent>
          {stats.leechCards.length === 0
            ? <p className="py-4 text-muted-foreground">No leeches. Nothing is being forgotten over and over.</p>
            : (
                <ul className="divide-y divide-border">
                  {stats.leechCards.map(card => (
                    <li key={card.cardId} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">{card.textSource}</span>
                        <span className="text-xs text-muted-foreground">{directionLabel(card.direction)}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                        {card.lapses}
                        {' '}
                        misses
                      </span>
                    </li>
                  ))}
                </ul>
              )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FsrsStats;
