'use client';

import type { EQuestionType } from '@/enum/vocab-trainer';
import { getQuestionTypeLabel } from '@/constants/vocab-trainer';
import type { TExamResult, TExamSubmitResponse, TQuestion } from '@/types/vocab-trainer';
import {
  AltArrowLeft,
  Calendar,
  Chart,
  ChartSquare,
  CheckCircle,
  ClockCircle,
  CloseCircle,
  Document,
  MagicStick,
  RefreshCircle,
  Target,
} from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function parseContentWithQuotedHighlight(content: string): React.ReactNode {
  const parts = content.split('"');
  if (parts.length === 1) {
    return content;
  }
  return parts.map((segment, i) => {
    if (i % 2 === 1) {
      return (
        <span key={`quote-${segment.slice(0, 20)}-${segment.length}`} className="text-primary">
          &quot;
          {segment}
          &quot;
        </span>
      );
    }
    return segment;
  });
}

const PASS_TARGET_PERCENT = 70;

function formatDurationColon(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatAvgPerQuestion(totalSeconds: number, count: number): string {
  if (count <= 0) {
    return 'AVG. — PER QUESTION';
  }
  const avg = Math.round(totalSeconds / count);
  if (avg < 60) {
    return `AVG. ${avg}S PER QUESTION`;
  }
  const mm = Math.floor(avg / 60);
  const ss = avg % 60;
  return `AVG. ${mm}M ${ss}S PER QUESTION`;
}

function formatCompletedAt(value: string | Date | undefined): string {
  if (!value) {
    return new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

type ExamResultsProps = {
  trainerId: string;
  results: TExamSubmitResponse;
  questions: TQuestion[];
  selectedAnswers: Map<number, string>;
  timeElapsed: number;
  onBackToTrainers: () => void;
  jobId?: string;
  completedAt?: string | Date;
  onRetryExam?: () => void;
  onExportPdf?: () => void;
  scoreDelta?: string;
  durationFasterText?: string;
  questionType?: EQuestionType;
};

const CIRCLE_SIZE = 112;
const CIRCLE_R = 38;
const CIRCLE_STROKE = 8;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

const ExamResults: React.FC<ExamResultsProps> = ({
  trainerId,
  results,
  questions,
  selectedAnswers,
  timeElapsed,
  onBackToTrainers,
  jobId,
  completedAt,
  onRetryExam,
  onExportPdf,
  scoreDelta,
  durationFasterText,
  questionType,
}) => {
  const handleBackToTrainers = () => {
    const storageKey = `exam_data_${trainerId}`;
    localStorage.removeItem(storageKey);
    onBackToTrainers();
  };

  const examResults = results?.results ?? [];
  const correctAnswers = examResults.filter((r: TExamResult) => r.status === 'PASSED').length;
  const totalQuestions = questions.length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const accuracyPercentage = scorePercentage;
  const scoreStrokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - scorePercentage / 100);
  const scorePassed = scorePercentage >= PASS_TARGET_PERCENT;
  const avgPerQuestionText = formatAvgPerQuestion(timeElapsed, totalQuestions);

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Exam Results
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {jobId && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Target size={14} weight="BoldDuotone" />
                  Job ID:
                  {' '}
                  <span className="text-primary underline">
                    {jobId}
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar size={14} weight="BoldDuotone" />
                Completed:
                {' '}
                {formatCompletedAt(completedAt)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onExportPdf && (
              <Button
                type="button"
                variant="outline"
                onClick={onExportPdf}
                className="border-border text-foreground"
              >
                <Document size={18} weight="BoldDuotone" className="mr-2" />
                Export PDF
              </Button>
            )}
            {onRetryExam && (
              <Button
                type="button"
                onClick={onRetryExam}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCircle size={18} weight="BoldDuotone" className="mr-2" />
                Retry Exam
              </Button>
            )}
          </div>
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
                  <span className="text-2xl font-bold text-primary">
                    {scorePercentage}
                    %
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    SCORE
                  </span>
                </span>
              </div>
              <span
                className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
                  scorePassed
                    ? 'border-success/50 bg-success/10 text-success'
                    : 'border-destructive/50 bg-destructive/10 text-destructive'
                }`}
              >
                {scorePassed ? 'PASSED' : 'FAILED'}
              </span>
              <p className="text-center text-xs text-muted-foreground">
                {scorePassed
                  ? `Great job! You exceeded the ${PASS_TARGET_PERCENT}% target.`
                  : `Keep practicing to reach the ${PASS_TARGET_PERCENT}% target.`}
              </p>
              {scoreDelta && (
                <p className="flex items-center justify-center gap-1.5 text-xs text-success">
                  <Chart size={14} weight="BoldDuotone" />
                  {scoreDelta}
                </p>
              )}
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
                  {accuracyPercentage}
                  %
                </p>
                <p className="text-sm text-muted-foreground">
                  {correctAnswers}
                  /
                  {totalQuestions}
                  {' '}
                  items
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700"
                  style={{ width: `${accuracyPercentage}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground uppercase">
                <span>Performance</span>
                <span>Target: 90%</span>
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
                {formatDurationColon(timeElapsed)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground italic">
                &quot;Efficiency is key&quot;
              </p>
              <p className="mt-2 text-xs text-muted-foreground uppercase">
                {avgPerQuestionText}
              </p>
              {durationFasterText && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-warning">
                  <ClockCircle size={16} weight="BoldDuotone" />
                  {durationFasterText}
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ChartSquare size={22} weight="BoldDuotone" className="text-primary" />
            Detailed Performance Review
          </h2>

          <div className="space-y-4">
            {questions.map((question, index) => {
              const result = examResults[index] as TExamResult | undefined;
              const userAnswer = result?.userSelected ?? selectedAnswers.get(index) ?? 'Not answered';
              const isCorrect = result
                ? result.status === 'PASSED'
                : (selectedAnswers.get(index)?.trim() === question.correctAnswer);
              const explanation = result?.data?.explanation;
              const correctAnswer = result?.systemSelected?.trim() || question?.correctAnswer?.trim() || '—';
              const questionContent = parseContentWithQuotedHighlight(question.content);

              return (
                <Card
                  key={question.id ?? `q-${question.content.slice(0, 50)}`}
                  className="border border-border bg-card"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                          Question
                          {' '}
                          {index + 1}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {isCorrect
                            ? (
                                <>
                                  <CheckCircle size={18} weight="BoldDuotone" className="text-success" />
                                  <span className="text-sm font-semibold text-success">Correct</span>
                                </>
                              )
                            : (
                                <>
                                  <CloseCircle size={18} weight="BoldDuotone" className="text-destructive" />
                                  <span className="text-sm font-semibold text-destructive">Incorrect</span>
                                </>
                              )}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {questionType
                          ? `Vocabulary: ${getQuestionTypeLabel(questionType)}`
                          : 'Vocabulary'}
                      </span>
                    </div>

                    <p className="text-base leading-snug font-bold text-foreground">
                      {questionContent}
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Your answer
                        </p>
                        <div
                          className={`min-h-[2.75rem] rounded-lg border px-3 py-2 font-semibold text-foreground ${
                            isCorrect
                              ? 'border-success/50 bg-success/10'
                              : 'border-destructive/50 bg-destructive/10'
                          }`}
                        >
                          {userAnswer}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Correct answer
                        </p>
                        <div className="min-h-[2.75rem] rounded-lg border border-success/50 bg-success/10 px-3 py-2 font-semibold text-foreground">
                          {correctAnswer}
                        </div>
                      </div>
                    </div>

                    {explanation && (
                      <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
                        <p className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
                          <MagicStick size={18} weight="BoldDuotone" />
                          AI Explanation
                        </p>
                        <p className="text-sm text-foreground">
                          {explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="flex justify-center pt-4">
          <Button
            type="button"
            onClick={handleBackToTrainers}
            variant="outline"
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

export default ExamResults;
