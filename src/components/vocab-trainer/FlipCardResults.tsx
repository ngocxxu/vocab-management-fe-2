'use client';

import type { TFlipCardExamData } from '@/types/vocab-trainer';
import {
  AltArrowLeft,
  CheckCircle,
  ClockCircle,
  CloseCircle,
  MedalStar,
  Target,
} from '@solar-icons/react/ssr';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FlipCardResultsProps = {
  trainerId: string;
  examData: TFlipCardExamData;
  onBackToTrainers: () => void;
};

const FlipCardResults: React.FC<FlipCardResultsProps> = ({
  examData,
  onBackToTrainers,
}) => {
  const { questions, results, totalTimeElapsed } = examData;

  // Calculate statistics
  const totalCards = questions.length;
  const knownCount = results.filter(r => r.assessment === 'known').length;
  const unknownCount = results.filter(r => r.assessment === 'unknown').length;
  const knownPercentage = Math.round((knownCount / totalCards) * 100);
  const isPassed = knownPercentage >= 70; // Assuming 70% is passing

  // Data for pie chart
  const chartData = [
    { name: 'Known', value: knownCount, color: '#84cc16' }, // lime-500
    { name: 'Unknown', value: unknownCount, color: '#ef4444' }, // red-500
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) {
      return 'text-emerald-600 dark:text-lime-400';
    }
    if (percentage >= 60) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-red-400';
  };

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 80) {
      return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/50 dark:bg-lime-400/20 dark:text-lime-400 dark:border-lime-400/50';
    }
    if (percentage >= 60) {
      return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50 dark:bg-yellow-400/20 dark:text-yellow-400 dark:border-yellow-400/50';
    }
    return 'bg-red-400/20 text-red-400 border-red-400/50';
  };

  return (
    <div className="relative space-y-8 py-8">
      {/* Results Summary */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Score Display */}
          <Card className="border-2 border-yellow-500/30 bg-white backdrop-blur-sm dark:border-yellow-400/30 dark:bg-slate-900">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <MedalStar size={32} weight="BoldDuotone" className="text-yellow-600 dark:text-yellow-400" />
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                  FlipCard Exam Completed!
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Large Score Display */}
              <div className="text-center">
                <div className={`text-8xl font-bold ${getScoreColor(knownPercentage)} mb-4`}>
                  {knownPercentage}
                  <span className="text-4xl">%</span>
                </div>

                <Badge className={`px-6 py-3 text-xl ${getScoreBadgeColor(knownPercentage)}`}>
                  {isPassed ? 'PASSED' : 'NEEDS PRACTICE'}
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-yellow-500/30 bg-white p-4 text-center dark:border-yellow-400/30 dark:bg-slate-900">
                  <div className="mb-2 flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300">
                    <Target size={20} weight="BoldDuotone" />
                    <span className="text-sm font-medium">Known</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {knownCount}
                    <span className="text-lg text-slate-600 dark:text-slate-400">
                      /
                      {totalCards}
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-500/30 bg-white p-4 text-center dark:border-yellow-400/30 dark:bg-slate-900">
                  <div className="mb-2 flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300">
                    <ClockCircle size={20} weight="BoldDuotone" />
                    <span className="text-sm font-medium">Time Taken</span>
                  </div>
                  <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                    {formatTime(totalTimeElapsed)}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={onBackToTrainers}
                  className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-teal-700 hover:shadow-emerald-500/25 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 dark:hover:shadow-emerald-400/25"
                >
                  <AltArrowLeft size={20} weight="BoldDuotone" className="mr-2" />
                  Back to Trainers
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Chart */}
          <Card className="border-2 border-yellow-500/30 bg-white backdrop-blur-sm dark:border-yellow-400/30 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-semibold text-slate-900 dark:text-white">
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pie Chart */}
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
                      {chartData.map((entry, _) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend */}
              <div className="space-y-3">
                {chartData.map(item => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-white p-3 dark:border-yellow-400/20 dark:bg-slate-900">
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
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
      </div>

      {/* Detailed Results Table */}
      <Card className="mx-auto w-full max-w-6xl border-2 border-yellow-400/30 bg-white backdrop-blur-sm dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-white">
            Card Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-yellow-500/20 dark:border-yellow-400/20">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-600 dark:text-yellow-400">#</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-600 dark:text-yellow-400">Front Language</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-600 dark:text-yellow-400">Front Text</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-600 dark:text-yellow-400">Back Language</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-600 dark:text-yellow-400">Back Text</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-600 dark:text-yellow-400">ACK</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const isKnown = result.assessment === 'known';

                  return (
                    <tr
                      key={`result-${result.cardIndex}`}
                      className={`border-b border-yellow-500/10 dark:border-yellow-400/10 ${
                        isKnown
                          ? 'bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-lime-400/5 dark:to-green-500/5'
                          : 'bg-gradient-to-r from-red-400/5 to-red-500/5'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {result.cardIndex + 1}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:border-yellow-400/50 dark:bg-yellow-400/10 dark:text-yellow-400">
                          {(result.frontLanguageCode || 'EN').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white">
                        {(result.frontText || ['No text']).join(', ')}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-lime-400/50 dark:bg-lime-400/10 dark:text-lime-400">
                          {(result.backLanguageCode || 'VI').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white">
                        {(result.backText || ['No text']).join(', ')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {isKnown
                            ? (
                                <CheckCircle size={16} weight="BoldDuotone" className="text-lime-400" />
                              )
                            : (
                                <CloseCircle size={16} weight="BoldDuotone" className="text-red-400" />
                              )}
                          <Badge
                            className={
                              isKnown
                                ? 'bg-emerald-500/20 text-emerald-700 dark:bg-lime-400/20 dark:text-lime-400'
                                : 'bg-red-400/20 text-red-400'
                            }
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
  );
};

export default FlipCardResults;
