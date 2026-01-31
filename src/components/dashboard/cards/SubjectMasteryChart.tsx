'use client';

import type { MasteryBySubject } from '@/types/statistics';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const getColor = (mastery: number): string => {
  if (mastery >= 8) {
    return '#10b981';
  }
  if (mastery >= 6) {
    return '#3b82f6';
  }
  if (mastery >= 4) {
    return '#f59e0b';
  }
  return '#ef4444';
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      subjectName: string;
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
    const subjectName = 'subjectName' in data ? String(data.subjectName) : 'N/A';
    const averageMastery = 'averageMastery' in data && typeof data.averageMastery === 'number' ? data.averageMastery : 0;
    const vocabCount = 'vocabCount' in data ? String(data.vocabCount) : '0';

    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="font-semibold text-foreground">{subjectName}</p>
        <p className="text-sm text-muted-foreground">
          Average Mastery:
          {' '}
          <span className="font-medium">{averageMastery.toFixed(1)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Vocab Count:
          {' '}
          <span className="font-medium">{vocabCount}</span>
        </p>
      </div>
    );
  }
  return null;
};

type SubjectMasteryChartProps = {
  data: MasteryBySubject[];
};

export const SubjectMasteryChart: React.FC<SubjectMasteryChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full overflow-hidden border-0 bg-card shadow-lg">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-xl font-bold text-foreground">Mastery by Subject</CardTitle>
          <p className="text-sm text-muted-foreground">Average mastery scores grouped by subject.</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => b.averageMastery - a.averageMastery);

  return (
    <Card className="h-full overflow-hidden border-0 bg-card shadow-lg">
      <CardHeader className="border-b border-border pb-4">
        <div>
          <CardTitle className="text-xl font-bold text-foreground">Mastery by Subject</CardTitle>
          <p className="text-sm text-muted-foreground">Average mastery scores grouped by subject.</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              type="number"
              domain={[0, 10]}
              className="text-xs text-muted-foreground"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              type="category"
              dataKey="subjectName"
              width={90}
              className="text-xs text-muted-foreground"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="averageMastery" radius={[0, 8, 8, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.averageMastery)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
