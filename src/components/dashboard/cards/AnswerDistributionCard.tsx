'use client';

import type { AnswerDistributionCardProps } from '@/types';
import { defineChart } from '@tanstack/charts';
import { polar, radialArc } from '@tanstack/charts/polar';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/react-charts/tooltip';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { renderChartTooltipBody } from '@/features/dashboard/ui/ChartTooltipBody';

const CORRECT_COLOR = 'var(--success)';
const INCORRECT_COLOR = 'var(--destructive)';
const PAD_ANGLE_RADIANS = 0.02;

type TDonutSlice = { name: string; value: number; color: string };

export const AnswerDistributionCard: React.FC<AnswerDistributionCardProps> = ({ data }) => {
  const total = data.totalCorrect + data.totalIncorrect;
  const successPct = total > 0 ? ((data.totalCorrect / total) * 100).toFixed(1) : '0';
  const correctPct = total > 0 ? ((data.totalCorrect / total) * 100).toFixed(1) : '0.0';
  const incorrectPct = total > 0 ? ((data.totalIncorrect / total) * 100).toFixed(1) : '0.0';

  const donutData: TDonutSlice[] = [
    { name: 'Correct', value: data.totalCorrect, color: CORRECT_COLOR },
    { name: 'Incorrect', value: data.totalIncorrect, color: INCORRECT_COLOR },
  ];

  const cumulativeAngle = (index: number): number => {
    if (total <= 0) {
      return 0;
    }
    const cumulativeValue = donutData.slice(0, index).reduce((sum, slice) => sum + slice.value, 0);
    return (cumulativeValue / total) * 2 * Math.PI;
  };

  const answerDistributionChart = defineChart({
    marks: [
      polar({
        marks: [
          radialArc(donutData, {
            startAngle: (_datum, index) => cumulativeAngle(index),
            endAngle: (datum, index) => cumulativeAngle(index) + (total > 0 ? (datum.value / total) * 2 * Math.PI : 0),
            padAngle: () => PAD_ANGLE_RADIANS,
            innerRadius: 92,
            outerRadius: 136,
            fill: d => d.color,
          }),
        ],
      }),
    ],
    tooltip: {
      use: tooltip,
      content: (points) => {
        const point = points[0];
        if (!point) {
          return { rows: [] };
        }
        return {
          title: point.datum.name,
          rows: [{ label: 'Answers', value: String(point.datum.value) }],
        };
      },
    },
  });

  return (
    <Card className="flex h-full flex-col overflow-visible border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">Answer Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative h-[320px] w-full">
            <Chart
              definition={answerDistributionChart}
              height={320}
              ariaLabel="Correct versus incorrect answer distribution"
              renderTooltipBody={renderChartTooltipBody}
            />
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
