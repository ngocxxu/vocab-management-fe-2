'use client';

import type { ProgressChartProps } from '@/types';
import { areaY, d3Curve, defineChart, lineY } from '@tanstack/charts';
import { scaleLinear } from '@tanstack/charts-scales/linear';
import { scalePoint } from '@tanstack/charts-scales/point';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/react-charts/tooltip';
import { curveMonotoneX } from 'd3-shape';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { renderChartTooltipBody } from '@/features/dashboard/ui/ChartTooltipBody';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate().toString().padStart(2, '0');
  return `${month} ${day}`;
};

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full overflow-hidden border-0 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Mastery Progress</CardTitle>
              <p className="text-sm text-muted-foreground">Average mastery score trend over time.</p>
            </div>
            <Select value="weekly">
              <SelectTrigger className="h-9 w-[130px] rounded-lg border-border bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    formattedDate: formatDate(item.date),
  }));

  const progressChart = defineChart({
    marks: [
      areaY(chartData, {
        x: 'formattedDate',
        y: 'averageMastery',
        fill: 'var(--chart-1)',
        fillOpacity: 0.25,
        curve: d3Curve(curveMonotoneX),
      }),
      lineY(chartData, {
        x: 'formattedDate',
        y: 'averageMastery',
        stroke: 'var(--chart-1)',
        strokeWidth: 2,
        curve: d3Curve(curveMonotoneX),
        points: true,
      }),
    ],
    x: { scale: () => scalePoint(), grid: false },
    y: { scale: () => scaleLinear().domain([0, 10]), grid: true },
    tooltip: {
      use: tooltip,
      content: (points) => {
        const point = points[0];
        if (!point) {
          return { rows: [] };
        }
        return {
          title: String(point.xValue),
          rows: [{ label: 'Average Mastery', value: point.datum.averageMastery.toFixed(1) }],
        };
      },
    },
  });

  return (
    <Card className="h-full overflow-hidden border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Mastery Progress</CardTitle>
            <p className="text-sm text-muted-foreground">Average mastery score trend over time.</p>
          </div>
          <Select value="weekly">
            <SelectTrigger className="h-9 w-[130px] rounded-lg border-border bg-muted/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Chart
          definition={progressChart}
          height={300}
          ariaLabel="Average mastery score over time"
          renderTooltipBody={renderChartTooltipBody}
        />
      </CardContent>
    </Card>
  );
};
