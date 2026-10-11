'use client';

import type { TFsrsReviewStats } from '@/types/vocab-trainer';
import { AltArrowLeft } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { directionLabelKey, formatPercent, formatShortDate } from '@/utils/fsrs-review';
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
  const t = useTranslations('trainer.fsrs');
  const locale = useLocale();
  const noReviewsYet = stats.cardsByState.review === 0 && stats.trueRetention.reviews === 0;
  const { trueRetention } = stats;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:py-10">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/vocab-trainer">
            <AltArrowLeft size={16} weight="BoldDuotone" className="mr-1" />
            {t('review.back')}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{trainerName}</h1>
        <p className="text-muted-foreground">{t('stats.subtitle')}</p>
      </div>

      {stats.ended && (
        <Alert>
          <AlertTitle>{t('start.endedTitle')}</AlertTitle>
          <AlertDescription>{t('stats.endedBody')}</AlertDescription>
        </Alert>
      )}

      {noReviewsYet && !stats.ended && (
        <Alert>
          <AlertTitle>{t('stats.noReviewsTitle')}</AlertTitle>
          <AlertDescription>
            {t('stats.noReviewsBody')}
            {' '}
            <Link href={`/vocab-trainer/${trainerId}/review`} className="font-medium text-primary underline">{t('stats.startReviewing')}</Link>
          </AlertDescription>
        </Alert>
      )}

      <section aria-label={t('stats.summaryAria')} className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Tile label={t('stats.new')} value={stats.cardsByState.new} hint={t('stats.newHint')} />
        <Tile label={t('stats.inReview')} value={stats.cardsByState.review} hint={t('stats.inReviewHint')} />
        <Tile label={t('stats.mastered')} value={stats.mastered} hint={t('stats.masteredHint')} />
        <Tile label={t('stats.leeches')} value={stats.leeches} hint={t('stats.leechesHint')} />
        <Tile
          label={t('stats.retention')}
          value={formatPercent(trueRetention.value)}
          hint={trueRetention.value === null
            ? t('stats.retentionNoData')
            : t('stats.retentionHint', { reviews: trueRetention.reviews, days: trueRetention.windowDays })}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FsrsBarChart
          title={t('stats.forecastTitle')}
          description={t('stats.forecastDescription')}
          data={stats.forecast.map(day => ({ label: formatShortDate(day.date, locale), count: day.count }))}
          ariaLabel={t('stats.forecastAria')}
          valueLabel={t('stats.due')}
          emptyText={stats.ended ? t('stats.forecastEnded') : t('stats.forecastEmpty')}
        />
        <FsrsBarChart
          title={t('stats.stabilityTitle')}
          description={t('stats.stabilityDescription')}
          data={stats.stabilityBuckets.map(bucket => ({ label: bucket.label, count: bucket.count }))}
          ariaLabel={t('stats.stabilityAria')}
          valueLabel={t('stats.questions')}
          emptyText={t('stats.stabilityEmpty')}
        />
      </div>

      <Card className="border-0 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-foreground">{t('stats.byDirection')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">{t('stats.colDirection')}</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">{t('stats.colQuestions')}</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">{t('stats.colNew')}</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">{t('stats.colInReview')}</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">{t('stats.colMastered')}</th>
                <th scope="col" className="py-2 pl-2 text-right font-medium">{t('stats.colLeeches')}</th>
              </tr>
            </thead>
            <tbody>
              {stats.byDirection.map(row => (
                <tr key={row.direction} className="border-t border-border">
                  <th scope="row" className="py-2 pr-4 font-medium text-foreground">{t(directionLabelKey(row.direction))}</th>
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
          <CardTitle className="text-xl font-bold text-foreground">{t('stats.leechesTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('stats.leechesDescription')}</p>
        </CardHeader>
        <CardContent>
          {stats.leechCards.length === 0
            ? <p className="py-4 text-muted-foreground">{t('stats.leechesEmpty')}</p>
            : (
                <ul className="divide-y divide-border">
                  {stats.leechCards.map(card => (
                    <li key={card.cardId} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">{card.textSource}</span>
                        <span className="text-xs text-muted-foreground">{t(directionLabelKey(card.direction))}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                        {t('stats.misses', { count: card.lapses })}
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
