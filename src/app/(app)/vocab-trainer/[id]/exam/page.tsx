/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { EQuestionType } from '@/enum/vocab-trainer';

const ExamPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;
  const [_isLoading, setIsLoading] = useState(true);

  // Load exam data from localStorage and redirect based on questionType
  const loadExamDataAndRedirect = useCallback(() => {
    const storageKey = `exam_data_${trainerId}`;
    const cachedData = localStorage.getItem(storageKey);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setIsLoading(false);

        // Redirect based on questionType
        if (parsedData.questionType === EQuestionType.FLIP_CARD) {
          router.push(`/vocab-trainer/${trainerId}/exam/flip-card`);
        } else {
          // Default to multiple choice for other question types
          router.push(`/vocab-trainer/${trainerId}/exam/multiple-choice`);
        }
      } catch (err) {
        console.error('Failed to parse cached exam data:', err);
        localStorage.removeItem(storageKey);
        // Redirect to trainer list if data is corrupted
        router.push('/vocab-trainer');
      }
    } else {
      // No cached data - redirect to trainer list
      router.push('/vocab-trainer');
    }
  }, [trainerId, router]);

  // Load exam data and redirect
  useEffect(() => {
    loadExamDataAndRedirect();
  }, [loadExamDataAndRedirect]);

  // Show loading while checking localStorage and redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-lg text-slate-900 dark:text-white">Loading exam...</div>
    </div>
  );
};

export default ExamPage;
