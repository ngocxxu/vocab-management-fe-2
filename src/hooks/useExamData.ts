'use client';

import type { TExamGenerationProgress, TQuestionAPI } from '@/types/vocab-trainer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getExam } from '@/actions';
import { EQuestionType } from '@/enum/vocab-trainer';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/utils/socket-config';

// --- Helpers: Separate storage logic ---
const getStorageKey = (id: string) => `exam_data_${id}`;

const loadCachedData = (id: string): TQuestionAPI | null => {
  try {
    const cached = localStorage.getItem(getStorageKey(id));
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const saveCachedData = (id: string, data: TQuestionAPI) => {
  try {
    localStorage.setItem(getStorageKey(id), JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error', e);
  }
};

type UseExamDataOptions = {
  trainerId: string | null;
  autoLoad?: boolean;
  onSuccessAction?: (data: TQuestionAPI) => void;
  onErrorAction?: (error: unknown) => void;
};

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'failed';

export const useExamData = ({
  trainerId,
  autoLoad = true,
  onSuccessAction,
  onErrorAction,
}: UseExamDataOptions) => {
  // State
  const [examData, setExamData] = useState<TQuestionAPI | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<unknown>(null);

  // Hooks & Refs
  const { socket, isConnected } = useSocket();
  const jobIdRef = useRef<string | null>(null);

  const latestActions = useRef({ onSuccessAction, onErrorAction });
  const trainerIdRef = useRef(trainerId);

  // Derived state
  const isLoading = status === 'generating';
  const isError = status === 'failed';

  // --- Effect: Sync Refs ---
  useEffect(() => {
    latestActions.current = { onSuccessAction, onErrorAction };
    trainerIdRef.current = trainerId;
  }, [onSuccessAction, onErrorAction, trainerId]);

  // --- Core Logic: Fetch Data ---
  const loadExamData = useCallback(async () => {
    if (!trainerId) {
      return;
    }

    // 1. Check Cache
    const cached = loadCachedData(trainerId);
    if (cached?.questionAnswers?.length) {
      setExamData(cached);
      setStatus('completed');
      // Access callback via Ref to keep this hook's dependency stable
      latestActions.current.onSuccessAction?.(cached);
      return;
    }

    // 2. Fetch API
    try {
      setStatus('generating');
      setError(null);

      const data = await getExam(trainerId);
      setExamData(data);

      // Case A: Data is ready immediately
      if (data.questionAnswers?.length > 0) {
        saveCachedData(trainerId, data);
        setStatus('completed');
        latestActions.current.onSuccessAction?.(data);
        return;
      }

      // Case B: Need to wait for socket generation
      jobIdRef.current = data.jobId || trainerId;

      if (!socket?.connected) {
        console.warn('Socket not connected, waiting for connection...');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err);
      setStatus('failed');
      latestActions.current.onErrorAction?.(err);
    }
    // Dependencies: Only re-create this function if trainerId or socket instance changes.
    // Actions are accessed via Ref, so they are not needed here.
  }, [trainerId, socket]);

  // --- Core Logic: Socket Listener ---
  useEffect(() => {
    // Only subscribe if we are in 'generating' state and have a valid socket
    if (!socket || !isConnected || !jobIdRef.current || status !== 'generating') {
      return;
    }

    const handleProgress = (event: TExamGenerationProgress) => {
      // Security: Ensure event matches the current job
      // Convert both to string for comparison to handle type mismatch
      const currentJobId = String(jobIdRef.current);
      const eventJobId = String(event.jobId);

      if (eventJobId !== currentJobId) {
        return;
      }

      // Handle Failure
      if (event.status === 'failed') {
        const errMsg = event.data?.error || 'Generation failed';
        setError(errMsg);
        setStatus('failed');
        latestActions.current.onErrorAction?.(new Error(errMsg));
        return;
      }

      // Handle Completion
      if (event.status === 'completed' && event.data?.questions) {
        setExamData((prev) => {
          if (!prev) {
            return null;
          }

          const completedData: TQuestionAPI = {
            ...prev,
            questionAnswers: event.data!.questions || [],
            questionType: prev.questionType || EQuestionType.MULTIPLE_CHOICE,
          };

          const currentTrainerId = trainerIdRef.current;
          if (currentTrainerId) {
            saveCachedData(currentTrainerId, completedData);
          }

          return completedData;
        });

        setStatus('completed');
      }
    };

    socket.on(SOCKET_EVENTS.MULTIPLE_CHOICE_GENERATION_PROGRESS, handleProgress);

    return () => {
      socket.off(SOCKET_EVENTS.MULTIPLE_CHOICE_GENERATION_PROGRESS, handleProgress);
    };
  }, [socket, isConnected, status]);

  // --- Effect: Handle completion callback ---
  useEffect(() => {
    if (status === 'completed' && examData?.questionAnswers?.length) {
      // Only call once when transitioning from generating to completed
      latestActions.current.onSuccessAction?.(examData);
    }
  }, [status, examData]);

  // --- Auto Load ---
  useEffect(() => {
    if (autoLoad && trainerId) {
      loadExamData();
    }
  }, [autoLoad, trainerId, loadExamData]);

  // --- Reset Action ---
  const clearExamData = useCallback(() => {
    if (trainerId) {
      localStorage.removeItem(getStorageKey(trainerId));
    }
    setExamData(null);
    setStatus('idle');
    jobIdRef.current = null;
    setError(null);
  }, [trainerId]);

  return {
    examData,
    isLoading,
    isError,
    error,
    generationStatus: status,
    loadExamData,
    clearExamData,
  };
};
