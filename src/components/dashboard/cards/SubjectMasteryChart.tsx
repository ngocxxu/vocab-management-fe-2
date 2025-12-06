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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <p className="font-semibold text-slate-900 dark:text-white">{data.subjectName}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Average Mastery:
          {' '}
          <span className="font-medium">{data.averageMastery.toFixed(1)}</span>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Vocab Count:
          {' '}
          <span className="font-medium">{data.vocabCount}</span>
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
      <Card className="h-full overflow-hidden border-0 bg-white shadow-lg dark:bg-slate-800">
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Mastery by Subject</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">Average mastery scores grouped by subject.</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => b.averageMastery - a.averageMastery);

  return (
    <Card className="h-full overflow-hidden border-0 bg-white shadow-lg dark:bg-slate-800">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Mastery by Subject</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">Average mastery scores grouped by subject.</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              type="number"
              domain={[0, 10]}
              className="text-xs text-slate-600 dark:text-slate-400"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              type="category"
              dataKey="subjectName"
              width={90}
              className="text-xs text-slate-600 dark:text-slate-400"
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
