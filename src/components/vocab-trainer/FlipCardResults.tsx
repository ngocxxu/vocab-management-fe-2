'use client';

import type { FlipCardResultsProps } from '@/types/vocab-trainer';
import { AltArrowLeft, Calendar, ChartSquare, CheckCircle, ClockCircle, CloseCircle, Target } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

const PASS_TARGET_PERCENT = 70;

const CIRCLE_SIZE = 112;
const CIRCLE_R = 38;
const CIRCLE_STROKE = 8;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

const FlipCardResults: React.FC<FlipCardResultsProps> = ({
  examData,
  onBackToTrainers,
}) => {
  const { questions, results, totalTimeElapsed } = examData;

  const totalCards = questions.length;
  const knownCount = results.filter(r => r.assessment === 'known').length;
  const unknownCount = results.filter(r => r.assessment === 'unknown').length;
  const knownPercentage = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;
  const isPassed = knownPercentage >= PASS_TARGET_PERCENT;
  const scoreStrokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - knownPercentage / 100);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCompletedAt = (value?: string) => {
    if (!value) {
      return 'Just now';
    }

    return new Date(value).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Button
            type="button"
            onClick={onBackToTrainers}
            variant="link"
            className="border-border bg-secondary !p-0 text-foreground hover:bg-secondary/80"
          >
            <AltArrowLeft size={20} weight="BoldDuotone" className="mr-2" />
            Back to Trainers
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Exam Results
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar size={14} weight="BoldDuotone" />
                Completed:
                {' '}
                {formatCompletedAt(examData.completedAt)}
              </span>
            </div>
          </div>
          <div className="hidden sm:block" />
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="flex flex-col border border-border bg-card">
            <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 p-5">
              <div className="relative inline-flex items-center justify-center">
                <svg
                  width={CIRCLE_SIZE}
                  height={CIRCLE_SIZE}
                  viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
                  className="-rotate-90"
                  aria-hidden
                >
                  <circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={CIRCLE_R}
                    fill="none"
                    strokeWidth={CIRCLE_STROKE}
                    className="stroke-muted"
                  />
                  <circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={CIRCLE_R}
                    fill="none"
                    strokeWidth={CIRCLE_STROKE}
                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                    strokeDashoffset={scoreStrokeDashoffset}
                    strokeLinecap="round"
                    className="stroke-primary transition-[stroke-dashoffset] duration-700"
                  />
                </svg>
                <span className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-primary">
                    {knownPercentage}
                    %
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    SCORE
                  </span>
                </span>
              </div>
              <span
                className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
                  isPassed
                    ? 'border-success/50 bg-success/10 text-success'
                    : 'border-destructive/50 bg-destructive/10 text-destructive'
                }`}
              >
                {isPassed ? 'PASSED' : 'FAILED'}
              </span>
              <p className="text-center text-xs text-muted-foreground">
                {isPassed
                  ? `Great job! You exceeded the ${PASS_TARGET_PERCENT}% target.`
                  : `Keep practicing to reach the ${PASS_TARGET_PERCENT}% target.`}
              </p>
            </CardContent>
          </Card>

          <Card className="flex flex-col border border-border bg-card">
            <CardContent className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold tracking-wide text-foreground uppercase">
                  Accuracy
                </span>
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Target size={20} weight="BoldDuotone" className="text-primary" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-foreground">
                  {knownPercentage}
                  %
                </p>
                <p className="text-sm text-muted-foreground">
                  {knownCount}
                  /
                  {totalCards}
                  {' '}
                  items
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700"
                  style={{ width: `${knownPercentage}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground uppercase">
                <span>Performance</span>
                <span>
                  Need practice:
                  {' '}
                  {unknownCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col border border-border bg-card">
            <CardContent className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold tracking-wide text-foreground uppercase">
                  Duration
                </span>
                <div className="flex size-9 items-center justify-center rounded-lg bg-warning/10">
                  <ClockCircle size={20} weight="BoldDuotone" className="text-warning" />
                </div>
              </div>
              <p className="text-4xl font-bold text-foreground">
                {formatTime(totalTimeElapsed)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground italic">
                &quot;Efficiency is key&quot;
              </p>
              <p className="mt-2 text-xs text-muted-foreground uppercase">
                Average:
                {' '}
                {totalCards > 0 ? formatTime(Math.round(totalTimeElapsed / totalCards)) : '0:00'}
                {' '}
                per card
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ChartSquare size={22} weight="BoldDuotone" className="text-primary" />
            Detailed Performance Review
          </h2>

          <div className="space-y-4">
            {results.map((result) => {
              const isKnown = result.assessment === 'known';
              const frontText = (result.frontText || ['No text']).join(', ');
              const backText = (result.backText || ['No text']).join(', ');
              const frontLanguageCode = (result.frontLanguageCode || 'EN').toUpperCase();
              const backLanguageCode = (result.backLanguageCode || 'VI').toUpperCase();

              return (
                <Card
                  key={`result-${result.cardIndex}`}
                  className="border border-border bg-card"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                          Card
                          {' '}
                          {result.cardIndex + 1}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {isKnown
                            ? (
                                <>
                                  <CheckCircle size={18} weight="BoldDuotone" className="text-success" />
                                  <span className="text-sm font-semibold text-success">Known</span>
                                </>
                              )
                            : (
                                <>
                                  <CloseCircle size={18} weight="BoldDuotone" className="text-destructive" />
                                  <span className="text-sm font-semibold text-destructive">Needs practice</span>
                                </>
                              )}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Vocabulary: Flip Card
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Front text
                        </p>
                        <div className="min-h-[2.75rem] rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 font-semibold text-foreground">
                          <span className="mb-2 inline-flex rounded-md border border-primary/50 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {frontLanguageCode}
                          </span>
                          <p>{frontText}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Back text
                        </p>
                        <div
                          className={`min-h-[2.75rem] rounded-lg border px-3 py-2 font-semibold text-foreground ${
                            isKnown
                              ? 'border-success/50 bg-success/10'
                              : 'border-destructive/50 bg-destructive/10'
                          }`}
                        >
                          <span
                            className={`mb-2 inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                              isKnown
                                ? 'border-success/50 bg-success/10 text-success'
                                : 'border-destructive/50 bg-destructive/10 text-destructive'
                            }`}
                          >
                            {backLanguageCode}
                          </span>
                          <p>{backText}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="flex justify-center pt-4">
          <Button
            type="button"
            onClick={onBackToTrainers}
            variant="link"
            className="border-border bg-secondary text-foreground hover:bg-secondary/80"
          >
            <AltArrowLeft size={20} weight="BoldDuotone" className="mr-2" />
            Back to Trainers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlipCardResults;
