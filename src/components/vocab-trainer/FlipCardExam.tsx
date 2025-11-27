'use client';

import type { TFlipCardExamData, TFlipCardQuestion, TFlipCardResult } from '@/types/vocab-trainer';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { selectVoiceByCode } from '@/utils/textToSpeech';
import FlipCard from './FlipCard';
import FlipCardResults from './FlipCardResults';

type FlipCardExamProps = {
  trainerId: string;
  examData: any;
};

type ExamState = 'taking' | 'completed' | 'error';

const FlipCardExam: React.FC<FlipCardExamProps> = ({ trainerId, examData }) => {
  const router = useRouter();
  const { speak, cancel, voices } = useSpeechSynthesis();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [assessments, setAssessments] = useState<Map<number, 'known' | 'unknown'>>(() => {
    const map = new Map<number, 'known' | 'unknown'>();
    const questions = examData.questionAnswers || [];
    questions.forEach((_: TFlipCardQuestion, index: number) => {
      map.set(index, 'known');
    });
    return map;
  });
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [examState, setExamState] = useState<ExamState>('taking');
  const [examResults, setExamResults] = useState<TFlipCardExamData | null>(null);
  const [error] = useState<string | null>(null);

  const questions: TFlipCardQuestion[] = useMemo(() => examData.questionAnswers || [], [examData.questionAnswers]);
  const currentQuestion = questions[currentCardIndex];
  const totalCards = questions.length;
  const isLastCard = currentCardIndex === totalCards - 1;
  const isFirstCard = currentCardIndex === 0;

  const handlePlayAudio = useCallback(() => {
    if (!currentQuestion) {
      return;
    }

    const textToSpeak = isFlipped
      ? (currentQuestion.backText || []).join(', ')
      : (currentQuestion.frontText || []).join(', ');
    const langCode = isFlipped
      ? (currentQuestion.backLanguageCode || 'vi')
      : (currentQuestion.frontLanguageCode || 'en');

    cancel();
    speak({
      text: textToSpeak,
      voice: selectVoiceByCode(voices, langCode),
      rate: 0.9,
      pitch: 1,
      volume: 1,
    });
  }, [currentQuestion, isFlipped, speak, cancel, voices]);
  const handleAssessment = useCallback((assessment: 'known' | 'unknown') => {
    const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000);
    setAssessments((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentCardIndex, assessment);
      return newMap;
    });

    // Save to localStorage immediately
    const storageKey = `flipcard_results_${trainerId}`;
    const currentResults = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const result: TFlipCardResult = {
      cardIndex: currentCardIndex,
      frontText: currentQuestion?.frontText || ['No text'],
      backText: currentQuestion?.backText || ['No text'],
      frontLanguageCode: currentQuestion?.frontLanguageCode || 'EN',
      backLanguageCode: currentQuestion?.backLanguageCode || 'VI',
      assessment,
      timeSpent,
    };

    // Update or add result
    const existingIndex = currentResults.findIndex((r: TFlipCardResult) => r.cardIndex === currentCardIndex);
    if (existingIndex >= 0) {
      currentResults[existingIndex] = result;
    } else {
      currentResults.push(result);
    }

    localStorage.setItem(storageKey, JSON.stringify(currentResults));
  }, [currentCardIndex, currentQuestion, trainerId, cardStartTime]);

  const handleCardFlip = useCallback(() => {
    setIsFlipped(prev => !prev);

    // Auto-assess as "unknown" when user flips the card
    if (!isFlipped) {
      // User is flipping to see the answer, mark as unknown
      handleAssessment('unknown');
    }
  }, [isFlipped, handleAssessment]);

  const handleNext = () => {
    if (!isLastCard) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
      setCardStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (!isFirstCard) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
      setCardStartTime(Date.now());
    }
  };

  const handleComplete = () => {
    // Create final exam results
    const results: TFlipCardResult[] = [];
    for (let i = 0; i < totalCards; i++) {
      const question = questions[i];
      const assessment = assessments.get(i) || 'unknown';
      const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000);

      results.push({
        cardIndex: i,
        frontText: question?.frontText || ['No text'],
        backText: question?.backText || ['No text'],
        frontLanguageCode: question?.frontLanguageCode || 'EN',
        backLanguageCode: question?.backLanguageCode || 'VI',
        assessment,
        timeSpent,
      });
    }

    const finalExamData: TFlipCardExamData = {
      trainerId,
      trainerName: examData.name || 'FlipCard Exam',
      questions,
      results,
      totalTimeElapsed: timeElapsed,
      completedAt: new Date().toISOString(),
    };

    // Save final results to localStorage
    const storageKey = `flipcard_final_results_${trainerId}`;
    localStorage.setItem(storageKey, JSON.stringify(finalExamData));

    setExamResults(finalExamData);
    setExamState('completed');
  };

  const handleBackToTrainers = () => {
    // Clear localStorage before navigating back
    const examStorageKey = `exam_data_${trainerId}`;
    const resultsStorageKey = `flipcard_results_${trainerId}`;
    const finalResultsStorageKey = `flipcard_final_results_${trainerId}`;

    localStorage.removeItem(examStorageKey);
    localStorage.removeItem(resultsStorageKey);
    localStorage.removeItem(finalResultsStorageKey);

    router.push('/vocab-trainer');
  };

  // Timer effect
  useEffect(() => {
    if (examState !== 'taking') {
      return;
    }

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examState]);

  // Show results if exam is completed
  if (examState === 'completed' && examResults) {
    return (
      <FlipCardResults
        trainerId={trainerId}
        examData={examResults}
        onBackToTrainers={handleBackToTrainers}
      />
    );
  }

  // Show error state
  if (examState === 'error') {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'An error occurred during the exam.'}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleBackToTrainers} variant="outline">
            Back to Trainers
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <Alert>
        <AlertDescription>
          No cards available for this exam.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative space-y-8 py-8">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {examData.name || 'FlipCard Exam'}
            </h1>
            <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 p-2 text-yellow-600 dark:border-yellow-400/50 dark:bg-yellow-400/10 dark:text-yellow-400">
              <Clock className="h-4 w-4" />
              <span className="font-mono">
                {Math.floor(timeElapsed / 60)}
                :
                {(timeElapsed % 60).toString().padStart(2, '0')}
              </span>
            </Badge>
          </div>

        </div>
      </div>

      {/* Flip Card */}
      <div className="mx-auto max-w-4xl px-4">
        <FlipCard
          question={currentQuestion}
          isFlipped={isFlipped}
          onFlip={handleCardFlip}
          onPlayAudio={handlePlayAudio}
        />
      </div>

      {/* Navigation buttons */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstCard}
            className="group rounded-2xl border-2 border-yellow-500/50 bg-white px-6 py-3 text-slate-900 transition-all duration-300 hover:scale-105 hover:border-yellow-500 dark:border-yellow-400/50 dark:bg-slate-900 dark:text-white dark:hover:border-yellow-400"
          >
            <ChevronLeft className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-semibold">Previous</span>
          </Button>

          <div className="rounded-2xl border border-yellow-500/30 bg-white px-8 py-3 backdrop-blur-sm dark:border-yellow-400/30 dark:bg-slate-900">
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-300">Card</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentCardIndex + 1}
                <span className="text-lg text-slate-600 dark:text-slate-400">
                  /
                  {totalCards}
                </span>
              </div>
            </div>
          </div>

          {isLastCard
            ? (
                <Button
                  onClick={handleComplete}
                  className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-teal-700 hover:shadow-emerald-500/25 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 dark:hover:shadow-emerald-400/25"
                >
                  Complete Exam
                </Button>
              )
            : (
                <Button
                  variant="outline"
                  onClick={handleNext}
                  className="group rounded-2xl border-2 border-yellow-500/50 bg-white px-6 py-3 text-slate-900 transition-all duration-300 hover:scale-105 hover:border-yellow-500 hover:bg-slate-50 dark:border-yellow-400/50 dark:bg-slate-900 dark:text-white dark:hover:border-yellow-400 dark:hover:bg-slate-800"
                >
                  <span className="font-semibold">Next</span>
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              )}
        </div>
      </div>
    </div>
  );
};

export default FlipCardExam;
