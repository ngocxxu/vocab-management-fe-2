'use client';

import type { ProgressOverTime } from '@/types/statistics';
import React from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/hooks/useTheme';

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
  if (active && payload?.length && payload[0]) {
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
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate().toString().padStart(2, '0');
  return `${month} ${day}`;
};

type ProgressChartProps = {
  data: ProgressOverTime[];
};

const LINE_COLOR_LIGHT = '#1A73E8';
const LINE_COLOR_DARK = '#3B82F6';

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const { theme, mounted } = useTheme();
  const lineColor = mounted && theme === 'dark' ? LINE_COLOR_DARK : LINE_COLOR_LIGHT;

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
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="progressAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
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
              fill="url(#progressAreaFill)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="averageMastery"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ fill: lineColor, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
