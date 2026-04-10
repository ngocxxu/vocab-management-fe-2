'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { SummaryStatsCardProps, SummaryStatsMetricCardProps, TrendConfig } from '@/types';
import {
  AltArrowDown,
  AltArrowUp,
  Book,
  CheckCircle,
  ClockCircle,
  CloseCircle,
  Star,
} from '@solar-icons/react/ssr';
import React from 'react';

const trendIconMap = {
  arrowUp: AltArrowUp,
  arrowDown: AltArrowDown,
  clock: ClockCircle,
};

const trendPillClass: Record<TrendConfig['color'], string> = {
  success: 'bg-success/15 text-success',
  muted: 'bg-muted text-muted-foreground',
  destructive: 'bg-destructive/15 text-destructive',
};

const MetricCard: React.FC<SummaryStatsMetricCardProps> = ({
  title,
  value,
  icon,
  iconBgClass,
  trend,
}) => {
  const TrendIcon = trend ? trendIconMap[trend.icon] : null;
  return (
    <Card className="h-full overflow-hidden rounded-2xl border border-border bg-card shadow-md">
      <CardContent className="flex flex-col px-6 py-2">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBgClass}`}>
            {icon}
          </div>
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium min-[1600px]:gap-1.5 min-[1600px]:px-3 min-[1600px]:py-1.5 min-[1600px]:text-sm ${trendPillClass[trend.color]}`}
            >
              {TrendIcon && <TrendIcon size={12} weight="BoldDuotone" className="flex-shrink-0 min-[1600px]:!size-4" />}
              <span>{trend.text}</span>
            </span>
          )}
        </div>
        <p className="mt-4 text-xs font-semibold text-muted-foreground min-[1600px]:text-base sm:text-xl">
          {title}
        </p>
        <div className="mt-2 text-2xl font-bold tracking-tight text-foreground min-[1600px]:text-4xl sm:text-3xl">
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

export const SummaryStatsCard: React.FC<SummaryStatsCardProps> = ({ data }) => {
  const totalAnswers = data.totalCorrect + data.totalIncorrect;
  const accuracyPct = totalAnswers > 0 ? Math.round((data.totalCorrect / totalAnswers) * 100) : 0;

  const cards: Array<{
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    iconBgClass: string;
    trend?: TrendConfig;
  }> = [
    {
      title: 'Total Vocabs',
      value: data.totalVocabs.toLocaleString(),
      icon: <Book size={20} weight="BoldDuotone" className="text-primary" />,
      iconBgClass: 'bg-primary/10',
      trend: { text: '+12 this week', icon: 'arrowUp', color: 'success' },
    },
    {
      title: 'Correct Answers',
      value: data.totalCorrect.toLocaleString(),
      icon: <CheckCircle size={20} weight="BoldDuotone" className="text-success" />,
      iconBgClass: 'bg-success/10',
      trend: { text: `${accuracyPct}% Accuracy`, icon: 'arrowUp', color: 'success' },
    },
    {
      title: 'Incorrect',
      value: data.totalIncorrect.toLocaleString(),
      icon: <CloseCircle size={20} weight="BoldDuotone" className="text-destructive" />,
      iconBgClass: 'bg-destructive/10',
      trend: { text: 'Updated 2h ago', icon: 'clock', color: 'muted' },
    },
    {
      title: 'Avg. Mastery',
      value: (
        <span className="inline-flex items-baseline gap-0.5">
          <span className="text-2xl font-bold tracking-tight text-foreground min-[1600px]:text-4xl sm:text-3xl">{data.averageMastery.toFixed(1)}</span>
          <span className="text-base font-normal text-muted-foreground min-[1600px]:text-xl">/10</span>
        </span>
      ),
      icon: <Star size={20} weight="BoldDuotone" className="text-warning" />,
      iconBgClass: 'bg-warning/20',
      trend: { text: '-0.2 from last month', icon: 'arrowDown', color: 'destructive' },
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      {cards.map(c => (
        <MetricCard
          key={c.title}
          title={c.title}
          value={c.value}
          icon={c.icon}
          iconBgClass={c.iconBgClass}
          trend={c.trend}
        />
      ))}
    </div>
  );
};
