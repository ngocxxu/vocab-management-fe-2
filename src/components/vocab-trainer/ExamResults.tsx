'use client';

import type { TQuestion } from '@/types/vocab-trainer';
import { ArrowLeft, CheckCircle, Clock, Target, Trophy, XCircle } from 'lucide-react';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ExamResultsProps = {
  trainerId: string;
  results: any;
  questions: TQuestion[];
  selectedAnswers: Map<number, string>;
  timeElapsed: number;
  onBackToTrainers: () => void;
};

const ExamResults: React.FC<ExamResultsProps> = ({
  trainerId,
  results: _results,
  questions,
  selectedAnswers,
  timeElapsed,
  onBackToTrainers,
}) => {
  const handleBackToTrainers = () => {
    // Clear localStorage before navigating back
    const storageKey = `exam_data_${trainerId}`;
    localStorage.removeItem(storageKey);

    // Call the original callback
    onBackToTrainers();
  };

  // Calculate score
  const correctAnswers = questions.filter((question, index) => {
    const userAnswer = selectedAnswers.get(index);
    return userAnswer === question.correctAnswer;
  }).length;

  const totalQuestions = questions.length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const isPassed = scorePercentage >= 70; // Assuming 70% is passing

  // Data for pie chart
  const chartData = [
    { name: 'Correct', value: correctAnswers, color: '#84cc16' }, // lime-500
    { name: 'Incorrect', value: incorrectAnswers, color: '#ef4444' }, // red-500
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) {
      return 'text-lime-400';
    }
    if (percentage >= 60) {
      return 'text-yellow-400';
    }
    return 'text-red-400';
  };

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 80) {
      return 'bg-lime-400/20 text-lime-400 border-lime-400/50';
    }
    if (percentage >= 60) {
      return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50';
    }
    return 'bg-red-400/20 text-red-400 border-red-400/50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px] opacity-20" />

      <div className="relative space-y-8 py-8">
        {/* Results Summary */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column - Score Display */}
            <Card className="border-2 border-yellow-400/30 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-indigo-900/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  <CardTitle className="text-3xl font-bold text-white">
                    Exam Completed!
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Large Score Display */}
                <div className="text-center">
                  <div className={`text-8xl font-bold ${getScoreColor(scorePercentage)} mb-4`}>
                    {scorePercentage}
                    <span className="text-4xl">%</span>
                  </div>

                  <Badge className={`px-6 py-3 text-xl ${getScoreBadgeColor(scorePercentage)}`}>
                    {isPassed ? 'PASSED' : 'FAILED'}
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-indigo-800/30 to-purple-800/30 p-4 text-center">
                    <div className="mb-2 flex items-center justify-center space-x-2 text-slate-300">
                      <Target className="h-5 w-5" />
                      <span className="text-sm font-medium">Accuracy</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {correctAnswers}
                      <span className="text-lg text-slate-400">
                        /
                        {totalQuestions}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-indigo-800/30 to-purple-800/30 p-4 text-center">
                    <div className="mb-2 flex items-center justify-center space-x-2 text-slate-300">
                      <Clock className="h-5 w-5" />
                      <span className="text-sm font-medium">Time Taken</span>
                    </div>
                    <p className="font-mono text-2xl font-bold text-white">
                      {formatTime(timeElapsed)}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleBackToTrainers}
                    className="rounded-2xl bg-gradient-to-r from-lime-400 to-green-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-lime-500 hover:to-green-600 hover:shadow-lime-400/25"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Trainers
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Chart */}
            <Card className="border-2 border-yellow-400/30 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-indigo-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-semibold text-white">
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
                    <div key={item.name} className="flex items-center justify-between rounded-lg border border-yellow-400/20 bg-gradient-to-r from-indigo-800/20 to-purple-800/20 p-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-white">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{item.value}</div>
                        <div className="text-sm text-slate-300">
                          {Math.round((item.value / totalQuestions) * 100)}
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

        {/* Detailed Results */}
        <Card className="mx-auto w-full max-w-6xl border-2 border-yellow-400/30 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-indigo-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold text-white">
              Question Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers.get(index);
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div
                  key={`question-${question.content}-${index}`}
                  className={`rounded-2xl border-2 p-6 ${
                    isCorrect
                      ? 'border-lime-400/50 bg-gradient-to-br from-lime-400/10 to-green-500/10'
                      : 'border-red-400/50 bg-gradient-to-br from-red-400/10 to-red-500/10'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {isCorrect
                        ? (
                            <CheckCircle className="h-6 w-6 text-lime-400" />
                          )
                        : (
                            <XCircle className="h-6 w-6 text-red-400" />
                          )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="border-yellow-400/50 bg-yellow-400/10 text-yellow-400">
                          Question
                          {' '}
                          {index + 1}
                        </Badge>
                        {isCorrect
                          ? (
                              <Badge className="bg-lime-400/20 text-lime-400">
                                Correct
                              </Badge>
                            )
                          : (
                              <Badge className="bg-red-400/20 text-red-400">
                                Incorrect
                              </Badge>
                            )}
                      </div>

                      <p className="text-lg font-medium text-white">
                        {question.content}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-300">Your answer:</span>
                          <span className={`font-medium ${isCorrect ? 'text-lime-400' : 'text-red-400'}`}>
                            {userAnswer || 'Not answered'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-300">Correct answer:</span>
                            <span className="font-medium text-lime-400">
                              {question.correctAnswer}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamResults;
