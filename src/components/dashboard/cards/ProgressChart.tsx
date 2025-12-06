'use client';

import type { ProgressOverTime } from '@/types/statistics';
import React, { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <p className="font-semibold text-slate-900 dark:text-white">{data.date}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Average Mastery:
          {' '}
          <span className="font-medium">{data.averageMastery.toFixed(1)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

type ProgressChartProps = {
  data: ProgressOverTime[];
};

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  if (!data || data.length === 0) {
    return (
      <Card className="h-full overflow-hidden border-0 bg-white shadow-lg dark:bg-slate-800">
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Mastery Progress</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">Average mastery score over time.</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
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

  return (
    <Card className="h-full overflow-hidden border-0 bg-white shadow-lg dark:bg-slate-800">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Mastery Progress</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">Average mastery score over time.</p>
          </div>
          <Select value={chartType} onValueChange={(value: 'line' | 'area') => setChartType(value)}>
            <SelectTrigger className="h-10 w-28 rounded-xl border-slate-200 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-700 dark:focus:ring-blue-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="line">Line</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'area'
            ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis
                    dataKey="formattedDate"
                    className="text-xs text-slate-600 dark:text-slate-400"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    className="text-xs text-slate-600 dark:text-slate-400"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="averageMastery"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorMastery)"
                    strokeWidth={2}
                  />
                </AreaChart>
              )
            : (
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis
                    dataKey="formattedDate"
                    className="text-xs text-slate-600 dark:text-slate-400"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    className="text-xs text-slate-600 dark:text-slate-400"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="averageMastery"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
