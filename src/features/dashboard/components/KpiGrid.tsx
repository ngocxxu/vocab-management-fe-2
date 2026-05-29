import { Card, CardContent } from '@/components/ui/card';
import { computeAccuracyDelta } from '@/features/dashboard/utils/computeAccuracyDelta';
import { formatCount } from '@/features/dashboard/types';
import { getMasteryTextClass } from '@/features/dashboard/utils/masteryThresholds';
import type { TProgressOverTime, TMasterySummary } from '@/types/statistics';
import {
  AltArrowDown,
  AltArrowUp,
  Book,
  CheckCircle,
  CloseCircle,
  Star,
} from '@solar-icons/react/ssr';
import type { ReactNode } from 'react';

type TKpiGridProps = {
  summary: TMasterySummary;
  progress: TProgressOverTime[];
};

type TMetricCardProps = {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  iconBgClass: string;
  valueClassName?: string;
  trend?: { text: string; positive: boolean } | null;
};

function MetricCard({ title, value, icon, iconBgClass, valueClassName, trend }: TMetricCardProps) {
  return (
    <Card className="h-full overflow-hidden rounded-2xl border border-border bg-card shadow-md">
      <CardContent className="flex flex-col px-6 py-2">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBgClass}`}>
            {icon}
          </div>
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                trend.positive ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
              }`}
            >
              {trend.positive
                ? <AltArrowUp size={12} weight="BoldDuotone" />
                : <AltArrowDown size={12} weight="BoldDuotone" />}
              <span>{trend.text}</span>
            </span>
          )}
        </div>
        <p className="mt-4 text-xs font-semibold text-muted-foreground min-[1600px]:text-base sm:text-xl">
          {title}
        </p>
        <div className={`mt-2 text-2xl font-bold tracking-tight min-[1600px]:text-4xl sm:text-3xl ${valueClassName ?? 'text-foreground'}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiGrid({ summary, progress }: TKpiGridProps) {
  const totalAnswers = summary.totalCorrect + summary.totalIncorrect;
  const accuracyPct = totalAnswers > 0 ? Math.round((summary.totalCorrect / totalAnswers) * 100) : 0;
  const needReview = summary.criticalCount + summary.warningCount;
  const accuracyDelta = computeAccuracyDelta(progress, summary.totalCorrect, summary.totalIncorrect);

  const accuracyTrend = accuracyDelta !== null
    ? {
        text: `${accuracyDelta > 0 ? '↑' : '↓'} ${Math.abs(accuracyDelta)}%`,
        positive: accuracyDelta > 0,
      }
    : null;

  const masteryValueClass = getMasteryTextClass(summary.averageMastery);
  const needReviewClass = needReview > 0 ? 'text-warning' : 'text-success';
  const accuracyClass = getMasteryTextClass((accuracyPct / 100) * 10);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <MetricCard
        title="Total words"
        value={formatCount(summary.totalVocabs)}
        icon={<Book size={20} weight="BoldDuotone" className="text-primary" />}
        iconBgClass="bg-primary/10"
      />
      <MetricCard
        title="Avg. mastery"
        value={(
          <span className="inline-flex items-baseline gap-0.5">
            <span>{summary.averageMastery.toFixed(1)}</span>
            <span className="text-base font-normal text-muted-foreground min-[1600px]:text-xl">/10</span>
          </span>
        )}
        valueClassName={masteryValueClass}
        icon={<Star size={20} weight="BoldDuotone" className="text-warning" />}
        iconBgClass="bg-warning/20"
      />
      <MetricCard
        title="Accuracy"
        value={`${accuracyPct}%`}
        valueClassName={accuracyClass}
        icon={<CheckCircle size={20} weight="BoldDuotone" className="text-success" />}
        iconBgClass="bg-success/10"
        trend={accuracyTrend}
      />
      <MetricCard
        title="Need review"
        value={formatCount(needReview)}
        valueClassName={needReviewClass}
        icon={<CloseCircle size={20} weight="BoldDuotone" className="text-destructive" />}
        iconBgClass="bg-destructive/10"
      />
    </div>
  );
}
