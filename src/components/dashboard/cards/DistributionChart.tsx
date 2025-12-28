'use client';

import type { MasteryDistribution } from '@/types/statistics';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const getColor = (scoreRange: string): string => {
  const range = scoreRange.split('-');
  const min = Number.parseInt(range[0] || '0', 10);

  if (min >= 9) {
    return '#10b981';
  }
  if (min >= 7) {
    return '#3b82f6';
  }
  if (min >= 5) {
    return '#f59e0b';
  }
  if (min >= 3) {
    return '#f97316';
  }
  return '#ef4444';
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      count: number;
      total?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
};

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length && payload[0]) {
    const firstPayload = payload[0];
    const data = firstPayload.payload;
    const total = 'total' in data && typeof data.total === 'number' ? data.total : 0;
    const count = 'count' in data && typeof data.count === 'number' ? data.count : 0;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
    const scoreRange = 'scoreRange' in data ? String(data.scoreRange) : 'N/A';

    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <p className="font-semibold text-slate-900 dark:text-white">
          Score Range:
          {' '}
          {scoreRange}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Count:
          {' '}
          <span className="font-medium">{count}</span>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Percentage:
          {' '}
          <span className="font-medium">
            {percentage}
            %
          </span>
        </p>
      </div>
    );
  }
  return null;
};

type DistributionChartProps = {
  data: MasteryDistribution[];
};

export const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="overflow-hidden border-0 bg-white shadow-lg dark:bg-slate-800">
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Mastery Distribution</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">Distribution of mastery scores across all vocabs.</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.map(item => ({
    ...item,
    total,
  }));

  const scoreOrder = ['0', '1-2', '3-4', '5-6', '7-8', '9-10'];
  const sortedData = [...chartData].sort((a, b) => {
    const indexA = scoreOrder.indexOf(a.scoreRange);
    const indexB = scoreOrder.indexOf(b.scoreRange);
    return indexA - indexB;
  });

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-lg dark:bg-slate-800">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Mastery Distribution</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">Distribution of mastery scores across all vocabs.</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey="scoreRange"
              className="text-xs text-slate-600 dark:text-slate-400"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-xs text-slate-600 dark:text-slate-400"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.scoreRange)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
