'use client';

import type { ProgressOverTime } from '@/types/statistics';
import React, { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      date: string;
      averageMastery: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
};

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length && payload[0]) {
    const firstPayload = payload[0];
    const data = firstPayload.payload;
    const date = 'date' in data ? String(data.date) : 'N/A';
    const averageMastery = 'averageMastery' in data && typeof data.averageMastery === 'number' ? data.averageMastery : 0;

    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="font-semibold text-foreground">{date}</p>
        <p className="text-sm text-muted-foreground">
          Average Mastery:
          {' '}
          <span className="font-medium">{averageMastery.toFixed(1)}</span>
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
      <Card className="h-full overflow-hidden border-0 bg-card shadow-lg">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-xl font-bold text-foreground">Mastery Progress</CardTitle>
          <p className="text-sm text-muted-foreground">Average mastery score over time.</p>
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

  return (
    <Card className="h-full overflow-hidden border-0 bg-card shadow-lg">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Mastery Progress</CardTitle>
            <p className="text-sm text-muted-foreground">Average mastery score over time.</p>
          </div>
          <Select value={chartType} onValueChange={(value: 'line' | 'area') => setChartType(value)}>
            <SelectTrigger className="h-10 w-28 rounded-xl border-border focus:border-primary focus:ring-primary">
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
                      <stop offset="5%" stopColor="#137fec" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#137fec" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="formattedDate"
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="averageMastery"
                    stroke="#137fec"
                    fillOpacity={1}
                    fill="url(#colorMastery)"
                    strokeWidth={2}
                  />
                </AreaChart>
              )
            : (
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="formattedDate"
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="averageMastery"
                    stroke="#137fec"
                    strokeWidth={2}
                    dot={{ fill: '#137fec', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
