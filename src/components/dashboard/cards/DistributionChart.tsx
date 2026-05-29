'use client';

import { groupDistributionBuckets } from '@/features/dashboard/utils/groupDistributionBuckets';
import type { DistributionChartProps, DistributionChartTooltipProps } from '@/types';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BAR_FILL: Record<string, string> = {
  'bg-destructive': 'var(--destructive)',
  'bg-warning': 'var(--warning)',
  'bg-success': 'var(--success)',
};

const CustomTooltip = ({ active, payload }: DistributionChartTooltipProps) => {
  if (active && payload?.length && payload[0]) {
    const { name, count } = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
        <p className="font-medium text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">
          Count:
          {count}
        </p>
      </div>
    );
  }
  return null;
};

export const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="overflow-hidden border-0 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-foreground">Mastery Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const barData = groupDistributionBuckets(data).map(bar => ({
    name: bar.label,
    count: bar.count,
    color: BAR_FILL[bar.barClass] ?? 'var(--muted)',
  }));

  return (
    <Card className="overflow-hidden border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">Mastery Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              className="text-xs text-muted-foreground"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
