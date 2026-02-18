'use client';

import type {
  ExamState,
  FlipCardExamProps,
  TFlipCardExamData,
  TFlipCardQuestion,
  TFlipCardResult,
  TQuestionAPI,
} from '@/types/vocab-trainer';
import { AltArrowLeft, AltArrowRight } from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import { ExamErrorState } from '@/components/shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { selectVoiceByCode } from '@/utils/textToSpeech';
import FlipCard from './FlipCard';
import FlipCardResults from './FlipCardResults';
import VocabExamHeader from './VocabExamHeader';

const isTQuestionAPI = (data: TQuestionAPI | TFlipCardExamData): data is TQuestionAPI => {
  return 'questionAnswers' in data;
};

const FlipCardExam: React.FC<FlipCardExamProps> = ({ trainerId, examData }) => {
  const router = useRouter();
  const { speak, cancel, voices } = useSpeechSynthesis();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const questions: TFlipCardQuestion[] = useMemo(() => {
    if (isTQuestionAPI(examData)) {
      return (examData.questionAnswers || []) as unknown as TFlipCardQuestion[];
    }
    return examData.questions || [];
  }, [examData]);

  const [assessments, setAssessments] = useState<Map<number, 'known' | 'unknown'>>(() => {
    const map = new Map<number, 'known' | 'unknown'>();
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
  const currentQuestion = questions[currentCardIndex];
  const totalCards = questions.length;
  const timeRemaining = isTQuestionAPI(examData) && examData.setCountTime
    ? Math.max(0, examData.setCountTime - timeElapsed)
    : 0;
  const trainerName = isTQuestionAPI(examData) ? examData.name : examData.trainerName;
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
      trainerName: trainerName || 'FlipCard Exam',
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
      <ExamErrorState
        error={error}
        onBackToTrainers={handleBackToTrainers}
        fallbackMessage="An error occurred during the exam."
      />
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
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <VocabExamHeader
          trainerName={trainerName || 'FlipCard Exam'}
          currentQuestion={currentCardIndex + 1}
          totalQuestions={totalCards}
          timeRemaining={timeRemaining}
        />

        <div className="mx-auto max-w-4xl">
          <FlipCard
            question={currentQuestion}
            isFlipped={isFlipped}
            onFlip={handleCardFlip}
            onPlayAudio={handlePlayAudio}
          />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstCard}
            className="w-full border-border bg-secondary text-foreground hover:bg-secondary/80 sm:w-auto"
          >
            <AltArrowLeft size={20} weight="BoldDuotone" className="mr-2" />
            Previous
          </Button>

          <div className="text-center">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Card
            </p>
            <p className="text-2xl font-bold text-foreground">
              {currentCardIndex + 1}
              {' '}
              /
              {' '}
              {totalCards}
            </p>
          </div>

          {isLastCard
            ? (
                <Button
                  onClick={handleComplete}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                >
                  Complete Exam
                </Button>
              )
            : (
                <Button
                  variant="outline"
                  onClick={handleNext}
                  className="w-full border-border bg-secondary text-foreground hover:bg-secondary/80 sm:w-auto"
                >
                  Next
                  <AltArrowRight size={20} weight="BoldDuotone" className="ml-2" />
                </Button>
              )}
        </div>
      </div>
    </div>
  );
};

export default FlipCardExam;
