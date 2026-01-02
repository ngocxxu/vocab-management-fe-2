'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import FlipCardExam from '@/components/vocab-trainer/FlipCardExam';

const FlipCardExamPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.id as string;
  const [examData, setExamData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load exam data from localStorage only (no API call)
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
        // Redirect to trainer list if data is corrupted
        router.push('/vocab-trainer');
      }
    } else {
      // No cached data - redirect to trainer list
      router.push('/vocab-trainer');
    }
  }, [trainerId, router]);

  // Load exam data from localStorage only (no API call)
  useEffect(() => {
    loadExamDataFromStorage();
  }, [loadExamDataFromStorage]);

  // Clear localStorage when leaving the exam page
  useEffect(() => {
    // Clear localStorage when component unmounts (user leaves page)
    return () => {
      const storageKey = `exam_data_${trainerId}`;
      localStorage.removeItem(storageKey);
    };
  }, [trainerId]);

  // Show loading while checking localStorage
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-lg text-slate-900 dark:text-white">Loading FlipCard exam...</div>
      </div>
    );
  }

  // If no exam data, component will redirect, so this shouldn't render
  if (!examData) {
    return null;
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <FlipCardExam trainerId={trainerId} examData={examData} />
    </div>
  );
};

export default FlipCardExamPage;
