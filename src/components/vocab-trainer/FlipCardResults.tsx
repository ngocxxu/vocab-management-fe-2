'use client';

import type { FlipCardResultsProps } from '@/types/vocab-trainer';
import { AltArrowLeft, CheckCircle, ClockCircle, CloseCircle, MedalStar, Target } from '@solar-icons/react/ssr';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FlipCardResults: React.FC<FlipCardResultsProps> = ({
  examData,
  onBackToTrainers,
}) => {
  const { questions, results, totalTimeElapsed } = examData;

  const totalCards = questions.length;
  const knownCount = results.filter(r => r.assessment === 'known').length;
  const unknownCount = results.filter(r => r.assessment === 'unknown').length;
  const knownPercentage = Math.round((knownCount / totalCards) * 100);
  const isPassed = knownPercentage >= 70;

  const chartData = [
    { name: 'Known', value: knownCount, color: 'var(--success)' },
    { name: 'Unknown', value: unknownCount, color: 'var(--destructive)' },
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) {
      return 'text-success';
    }
    if (percentage >= 60) {
      return 'text-warning';
    }
    return 'text-destructive';
  };

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 80) {
      return 'border-success/50 bg-success/10 text-success';
    }
    if (percentage >= 60) {
      return 'border-warning/50 bg-warning/10 text-warning';
    }
    return 'border-destructive/50 bg-destructive/10 text-destructive';
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="border border-border bg-card">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2">
                <MedalStar size={32} weight="BoldDuotone" className="text-primary" />
                <CardTitle className="text-3xl font-bold text-foreground">
                  FlipCard Exam Completed!
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`mb-4 text-8xl font-bold ${getScoreColor(knownPercentage)}`}>
                  {knownPercentage}
                  <span className="text-4xl">%</span>
                </div>
                <Badge className={`px-6 py-3 text-xl ${getScoreBadgeColor(knownPercentage)}`}>
                  {isPassed ? 'PASSED' : 'NEEDS PRACTICE'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2 text-muted-foreground">
                    <Target size={20} weight="BoldDuotone" />
                    <span className="text-sm font-medium">Known</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {knownCount}
                    <span className="text-lg text-muted-foreground">
                      /
                      {totalCards}
                    </span>
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2 text-muted-foreground">
                    <ClockCircle size={20} weight="BoldDuotone" />
                    <span className="text-sm font-medium">Time Taken</span>
                  </div>
                  <p className="font-mono text-2xl font-bold text-foreground">
                    {formatTime(totalTimeElapsed)}
                  </p>
                </div>
              </div>
              <div className="flex justify-center pt-4">
                <Button
                  onClick={onBackToTrainers}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <AltArrowLeft size={20} weight="BoldDuotone" className="mr-2" />
                  Back to Trainers
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-semibold text-foreground">
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {chartData.map(entry => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {chartData.map(item => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{item.value}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round((item.value / totalCards) * 100)}
                        %
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold text-foreground">
              Card Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">#</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Front Language</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Front Text</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Back Language</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Back Text</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ACK</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => {
                    const isKnown = result.assessment === 'known';
                    return (
                      <tr
                        key={`result-${result.cardIndex}`}
                        className={`border-b border-border ${isKnown ? 'bg-success/5' : 'bg-destructive/5'}`}
                      >
                        <td className="px-6 py-4 font-medium text-foreground">
                          {result.cardIndex + 1}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary">
                            {(result.frontLanguageCode || 'EN').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {(result.frontText || ['No text']).join(', ')}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <Badge variant="outline" className="border-success/50 bg-success/10 text-success">
                            {(result.backLanguageCode || 'VI').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {(result.backText || ['No text']).join(', ')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isKnown
                              ? <CheckCircle size={16} weight="BoldDuotone" className="text-success" />
                              : <CloseCircle size={16} weight="BoldDuotone" className="text-destructive" />}
                            <Badge
                              className={isKnown ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}
                            >
                              {result.assessment}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlipCardResults;
