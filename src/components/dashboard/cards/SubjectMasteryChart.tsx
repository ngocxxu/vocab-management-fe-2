'use client';

import type { MasteryBySubject } from '@/types/statistics';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BAR_COLOR = '#1A73E8';

type SubjectMasteryChartProps = {
  data: MasteryBySubject[];
};

export const SubjectMasteryChart: React.FC<SubjectMasteryChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full overflow-hidden border-0 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-foreground">Mastery by Subject</CardTitle>
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
    <Card className="h-full overflow-hidden border-0 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">Mastery by Subject</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {sortedData.map((item) => {
            const pct = Math.round((item.averageMastery / 10) * 100);
            return (
              <div key={item.subjectId} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.subjectName}</span>
                  <span className="font-medium text-primary">{item.averageMastery.toFixed(1)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: BAR_COLOR }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
