'use client';

import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnswerDistributionCardProps } from '@/types';

const CORRECT_COLOR = 'var(--success)';
const INCORRECT_COLOR = 'var(--destructive)';

type TAnswerDistributionTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number } }>;
};

const AnswerDistributionTooltip = ({ active, payload }: TAnswerDistributionTooltipProps) => {
  if (!active || !payload?.length || !payload[0]) {
    return null;
  }

  const { name, value } = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="font-medium text-foreground">{name}</p>
      <p className="text-sm text-muted-foreground">
        Answers:
        {' '}
        <span className="font-medium text-foreground">{value}</span>
      </p>
    </div>
  );
};

export const AnswerDistributionCard: React.FC<AnswerDistributionCardProps> = ({ data }) => {
  const total = data.totalCorrect + data.totalIncorrect;
  const successPct = total > 0 ? ((data.totalCorrect / total) * 100).toFixed(1) : '0';
  const correctPct = total > 0 ? ((data.totalCorrect / total) * 100).toFixed(1) : '0.0';
  const incorrectPct = total > 0 ? ((data.totalIncorrect / total) * 100).toFixed(1) : '0.0';

  const donutData = [
    { name: 'Correct', value: data.totalCorrect, color: CORRECT_COLOR },
    { name: 'Incorrect', value: data.totalIncorrect, color: INCORRECT_COLOR },
  ];

  return (
    <Card className="flex h-full flex-col overflow-visible border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">Answer Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative h-[320px] w-full">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={92}
                  outerRadius={136}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {donutData.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<AnswerDistributionTooltip />} wrapperStyle={{ zIndex: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {successPct}
                %
              </span>
              <span className="text-xs font-medium text-muted-foreground">SUCCESS</span>
            </div>
          </div>
          <div className="mt-4 flex w-full max-w-[180px] flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CORRECT_COLOR }} />
                <span className="text-muted-foreground">Correct</span>
              </div>
              <span className="font-medium text-foreground">
                {correctPct}
                %
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: INCORRECT_COLOR }} />
                <span className="text-muted-foreground">Incorrect</span>
              </div>
              <span className="font-medium text-foreground">
                {incorrectPct}
                %
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
