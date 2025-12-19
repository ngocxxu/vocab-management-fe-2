'use client';

import type { TQuestionAPI } from '@/types/vocab-trainer';
import { useCallback, useEffect, useState } from 'react';
import { getExam } from '@/actions';

type UseExamDataOptions = {
  trainerId: string | null;
  autoLoad?: boolean; // Whether to automatically load data on mount
  onSuccessAction?: (examData: TQuestionAPI) => void;
  onErrorAction?: (error: any) => void;
};

export const useExamData = ({ trainerId, autoLoad = true, onSuccessAction, onErrorAction }: UseExamDataOptions) => {
  const [examData, setExamData] = useState<TQuestionAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  // Get exam data from localStorage or fetch from API
  const loadExamData = useCallback(async () => {
    if (!trainerId) {
      return;
    }

    const storageKey = `exam_data_${trainerId}`;

    // Check localStorage first
    const cachedData = localStorage.getItem(storageKey);
    console.warn('Checking localStorage for:', storageKey, 'Found:', !!cachedData);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        console.warn('Using cached exam data:', parsedData);
        setExamData(parsedData);
        onSuccessAction?.(parsedData);
        return;
      } catch (error) {
        console.error('Failed to parse cached exam data:', error);
        localStorage.removeItem(storageKey);
      }
    }

    // If no cached data, fetch from API
    console.warn('Fetching exam data from API for trainer:', trainerId);
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const data = await getExam(trainerId);
      console.warn('API response:', data);

      // Cache the data in localStorage
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.warn('Exam data cached to localStorage with key:', storageKey);

      setExamData(data);
      onSuccessAction?.(data);
    } catch (err) {
      console.error('Failed to fetch exam data:', err);
      setIsError(true);
      setError(err);
      onErrorAction?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [trainerId, onSuccessAction, onErrorAction]);

  // Clear exam data from localStorage
  const clearExamData = useCallback(() => {
    if (!trainerId) {
      return;
    }

    const storageKey = `exam_data_${trainerId}`;
    localStorage.removeItem(storageKey);
    setExamData(null);
  }, [trainerId]);

  // Load exam data when trainerId changes - ONLY if autoLoad is true
  useEffect(() => {
    if (trainerId && autoLoad) {
      loadExamData();
    }
  }, [trainerId, loadExamData, autoLoad]);

  return {
    examData,
    isLoading,
    isError,
    error,
    loadExamData,
    clearExamData,
  };
};
