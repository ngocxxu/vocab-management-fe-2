'use client';

import { groupDistributionBuckets } from '@/features/dashboard/utils/groupDistributionBuckets';
import type { DistributionChartProps } from '@/types';
import { barY, defineChart } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts-scales/band';
import { scaleLinear } from '@tanstack/charts-scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/react-charts/tooltip';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { renderChartTooltipBody } from '@/features/dashboard/ui/ChartTooltipBody';

const BAR_FILL: Record<string, string> = {
  'bg-destructive': 'var(--destructive)',
  'bg-warning': 'var(--warning)',
  'bg-success': 'var(--success)',
};

export const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
  const t = useTranslations('dashboard');

  if (!data || data.length === 0) {
    return (
      <Card className="overflow-hidden border-0 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-foreground">{t('distribution.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            {t('noData')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const barData = groupDistributionBuckets(data).map(bar => ({
    name: t(bar.labelKey),
    count: bar.count,
    color: BAR_FILL[bar.barClass] ?? 'var(--muted)',
  }));

  const distributionChart = defineChart({
    marks: [
      barY(barData, {
        x: 'name',
        y: 'count',
        fill: d => d.color,
        radius: 6,
      }),
    ],
    x: { scale: () => scaleBand().padding(0.2), grid: false },
    y: { scale: () => scaleLinear(), nice: true, grid: true },
    tooltip: {
      use: tooltip,
      content: (points) => {
        const point = points[0];
        if (!point) {
          return { rows: [] };
        }
        return {
          title: String(point.xValue),
          rows: [{ label: t('distribution.count'), value: String(point.datum.count) }],
        };
      },
    },
  });

  return (
    <Card className="overflow-hidden border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">{t('distribution.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Chart
          definition={distributionChart}
          height={280}
          ariaLabel={t('distribution.aria')}
          renderTooltipBody={renderChartTooltipBody}
        />
      </CardContent>
    </Card>
  );
};
