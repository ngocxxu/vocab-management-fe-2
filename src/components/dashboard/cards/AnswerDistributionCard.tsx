'use client';

import type { MasterySummary } from '@/types/statistics';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CORRECT_COLOR = '#34A853';
const INCORRECT_COLOR = '#EA4335';

type AnswerDistributionCardProps = {
  data: MasterySummary;
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
    <Card className="flex h-full flex-col overflow-hidden border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">Answer Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative h-[200px] w-full">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
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
