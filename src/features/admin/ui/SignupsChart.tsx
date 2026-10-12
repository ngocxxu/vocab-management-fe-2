'use client';

import { barY, defineChart } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts-scales/band';
import { scaleLinear } from '@tanstack/charts-scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/react-charts/tooltip';
import React from 'react';
import { renderChartTooltipBody } from '@/components/shared/ChartTooltipBody';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type SignupsChartProps = Readonly<{
  title: string;
  description: string;
  data: Array<{ label: string; count: number }>;
  ariaLabel: string;
  /** What the tooltip calls one bar, for example "Signups". */
  valueLabel: string;
}>;

// Always draws every bar, zero days included, so the 30-day axis is never missing.
const SignupsChart: React.FC<SignupsChartProps> = ({ title, description, data, ariaLabel, valueLabel }) => {
  const definition = defineChart({
    marks: [
      barY(data, {
        x: 'label',
        y: 'count',
        fill: 'var(--chart-1)',
        radius: 4,
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
          rows: [{ label: valueLabel, value: String(point.datum.count) }],
        };
      },
    },
  });

  return (
    <Card className="overflow-hidden border-0 bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <Chart definition={definition} height={260} ariaLabel={ariaLabel} renderTooltipBody={renderChartTooltipBody} />
      </CardContent>
    </Card>
  );
};

export default SignupsChart;
