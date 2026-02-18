'use client';

import type { DistributionChartProps, DistributionChartTooltipProps } from '@/types';
import type { MasteryDistribution } from '@/types/statistics';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BAR_GROUPS = [
  { key: 'low', label: 'LOW (0-2)', scoreRanges: ['0', '1-2', '3-4'], color: '#EA4335' },
  { key: 'mid', label: 'MID (5-7)', scoreRanges: ['5-6', '7-8'], color: '#FBBC04' },
  { key: 'high', label: 'HIGH (8-10)', scoreRanges: ['9-10'], color: '#34A853' },
] as const;

function aggregateToBars(data: MasteryDistribution[]): { name: string; count: number; color: string }[] {
  if (!data.length) {
    return BAR_GROUPS.map(g => ({ name: g.label, count: 0, color: g.color }));
  }
  return BAR_GROUPS.map((group) => {
    const count = data
      .filter(d => (group.scoreRanges as readonly string[]).includes(d.scoreRange))
      .reduce((sum, d) => sum + d.count, 0);
    return { name: group.label, count, color: group.color };
  });
}

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

  const barData = aggregateToBars(data);

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
