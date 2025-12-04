/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import TranslationAudioExam from '@/components/vocab-trainer/TranslationAudioExam';

const TranslationAudioExamPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;
  const [examData, setExamData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadExamDataFromStorage = useCallback(() => {
    const storageKey = `exam_data_${trainerId}`;
    const cachedData = localStorage.getItem(storageKey);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setExamData(parsedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to parse cached exam data:', err);
        localStorage.removeItem(storageKey);
        router.push('/vocab-trainer');
      }
    } else {
      router.push('/vocab-trainer');
    }
  }, [trainerId, router]);

  useEffect(() => {
    loadExamDataFromStorage();
  }, [loadExamDataFromStorage]);

  useEffect(() => {
    return () => {
      const storageKey = `exam_data_${trainerId}`;
      localStorage.removeItem(storageKey);
    };
  }, [trainerId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-lg text-slate-900 dark:text-white">Loading exam...</div>
      </div>
    );
  }

  if (!examData) {
    return null;
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <TranslationAudioExam trainerId={trainerId} examData={examData} />
    </div>
  );
};

export default TranslationAudioExamPage;
