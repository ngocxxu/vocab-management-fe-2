import { Card, CardContent } from '@/components/ui/card';
import { formatCount } from '../types';
import { getMasteryTextClass } from '../utils/masteryThresholds';
import type { TMasterySummary } from '@/types/statistics';
import {
  Book,
  CheckCircle,
  DangerTriangle,
  Star,
} from '@solar-icons/react/ssr';
import type { ReactNode } from 'react';

type TKpiGridProps = {
  summary: TMasterySummary;
};

type TMetricCardProps = {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  cardClassName: string;
  iconBgClass: string;
  valueClassName?: string;
  trend: { text: string; className: string };
};

function MetricCard({ title, value, icon, cardClassName, iconBgClass, valueClassName, trend }: TMetricCardProps) {
  return (
    <Card className={`h-full overflow-hidden rounded-2xl border shadow-sm ${cardClassName}`}>
      <CardContent className="flex items-center gap-5 px-6 py-2">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${iconBgClass}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-muted-foreground sm:text-xl">
            {title}
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <div className={`text-3xl font-bold tracking-tight sm:text-4xl ${valueClassName ?? 'text-foreground'}`}>
              {value}
            </div>
            <span className={`text-base font-semibold sm:text-lg ${trend.className}`}>{trend.text}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiGrid({ summary }: TKpiGridProps) {
  const totalAnswers = summary.totalCorrect + summary.totalIncorrect;
  const accuracyPct = totalAnswers > 0 ? Math.round((summary.totalCorrect / totalAnswers) * 100) : 0;
  const needReview = summary.criticalCount + summary.warningCount;

  const masteryValueClass = getMasteryTextClass(summary.averageMastery);
  const needReviewClass = needReview > 0 ? 'text-warning' : 'text-success';
  const accuracyClass = getMasteryTextClass((accuracyPct / 100) * 10);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <MetricCard
        title="Total words"
        value={formatCount(summary.totalVocabs)}
        icon={<Book size={32} weight="BoldDuotone" className="text-primary" />}
        cardClassName="border-primary/15 bg-primary/5"
        iconBgClass="bg-primary/15"
        trend={{ text: '↑ +12%', className: 'text-success' }}
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
        icon={<Star size={32} weight="BoldDuotone" className="text-warning" />}
        cardClassName="border-warning/30 bg-warning/5"
        iconBgClass="bg-warning/20"
        trend={{ text: '↓ -0.2', className: 'text-destructive' }}
      />
      <MetricCard
        title="Accuracy"
        value={`${accuracyPct}%`}
        valueClassName={accuracyClass}
        icon={<CheckCircle size={32} weight="BoldDuotone" className="text-success" />}
        cardClassName="border-success/30 bg-success/5"
        iconBgClass="bg-success/15"
        trend={{ text: '↑ +5%', className: 'text-success' }}
      />
      <MetricCard
        title="Need review"
        value={formatCount(needReview)}
        valueClassName={needReviewClass}
        icon={<DangerTriangle size={32} weight="BoldDuotone" className="text-destructive" />}
        cardClassName="border-destructive/20 bg-destructive/5"
        iconBgClass="bg-destructive/15"
        trend={{ text: '↓ -2', className: 'text-success' }}
      />
    </div>
  );
}
