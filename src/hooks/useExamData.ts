'use client';

import type { TExamGenerationProgress, TQuestionAPI } from '@/types/vocab-trainer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getExam } from '@/actions';
import { EQuestionType } from '@/enum/vocab-trainer';
import { useSocket } from '@/hooks/useSocket';
import { logger } from '@/libs/Logger';
import { SOCKET_EVENTS } from '@/utils/socket-config';

// --- Storage helpers ---
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
    logger.error('Storage save error', { error: e, id });
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
  const [examData, setExamData] = useState<TQuestionAPI | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<unknown>(null);

  const { socket, isConnected } = useSocket();

  // Refs that never need to trigger a re-render
  const jobIdRef = useRef<string | null>(null);
  const trainerIdRef = useRef(trainerId);
  const loadPromiseRef = useRef<Promise<void> | null>(null);
  const successFiredRef = useRef(false);
  const latestActions = useRef({ onSuccessAction, onErrorAction });

  const isLoading = status === 'generating';
  const isError = status === 'failed';

  // Keep callback refs fresh without affecting other deps
  useEffect(() => {
    latestActions.current = { onSuccessAction, onErrorAction };
  }, [onSuccessAction, onErrorAction]);

  // Keep trainerId ref in sync
  useEffect(() => {
    trainerIdRef.current = trainerId;
  }, [trainerId]);

  const loadExamData = useCallback(async () => {
    if (!trainerId) {
      return;
    }
    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    const fireSuccess = (data: TQuestionAPI) => {
      if (!successFiredRef.current) {
        successFiredRef.current = true;
        latestActions.current.onSuccessAction?.(data);
      }
    };

    const loadPromise = (async () => {
      // 1. Cache hit
      const cached = loadCachedData(trainerId);
      if (cached?.questionAnswers?.length) {
        successFiredRef.current = false; // reset for this cycle
        setExamData(cached);
        setStatus('completed');
        fireSuccess(cached);
        return;
      }

      // 2. Fetch
      try {
        successFiredRef.current = false;
        setStatus('generating');
        setError(null);

        const data = await getExam(trainerId);
        setExamData(data);

        // Case A: ready immediately
        if (data.questionAnswers?.length > 0) {
          saveCachedData(trainerId, data);
          setStatus('completed');
          fireSuccess(data);
          return;
        }

        // Case B: wait for socket
        jobIdRef.current = data.jobId || trainerId;

        if (!socket?.connected) {
          logger.warn('Socket not connected, waiting for connection...', { trainerId });
        }
      } catch (err) {
        logger.error('Fetch error:', { error: err, trainerId });
        setError(err);
        setStatus('failed');
        latestActions.current.onErrorAction?.(err);
      }
    })();

    loadPromiseRef.current = loadPromise;
    try {
      await loadPromise;
    } finally {
      loadPromiseRef.current = null;
    }
  }, [trainerId, socket]);

  // Socket listener — only active while generating
  useEffect(() => {
    if (!socket || !isConnected || !jobIdRef.current || status !== 'generating') {
      return;
    }

    const handleProgress = (event: TExamGenerationProgress) => {
      if (String(event.jobId) !== String(jobIdRef.current)) {
        return;
      }

      if (event.status === 'failed') {
        const errMsg = event.data?.error || 'Generation failed';
        setError(errMsg);
        setStatus('failed');
        latestActions.current.onErrorAction?.(new Error(errMsg));
        return;
      }

      if (event.status === 'completed' && event.data?.questions) {
        const completedData: TQuestionAPI = {
          ...examData!,
          questionAnswers: event.data.questions,
          questionType: examData!.questionType ?? EQuestionType.MULTIPLE_CHOICE,
        };

        if (trainerIdRef.current) {
          saveCachedData(trainerIdRef.current, completedData);
        }

        setExamData(completedData);
        setStatus('completed');

        if (!successFiredRef.current) {
          successFiredRef.current = true;
          latestActions.current.onSuccessAction?.(completedData);
        }
      }
    };

    socket.on(SOCKET_EVENTS.MULTIPLE_CHOICE_GENERATION_PROGRESS, handleProgress);
    return () => {
      socket.off(SOCKET_EVENTS.MULTIPLE_CHOICE_GENERATION_PROGRESS, handleProgress);
    };
  }, [socket, isConnected, status, examData]);

  // Auto-load
  useEffect(() => {
    if (autoLoad && trainerId) {
      loadExamData();
    }
  }, [autoLoad, trainerId, loadExamData]);

  const clearExamData = useCallback(() => {
    if (trainerId) {
      localStorage.removeItem(getStorageKey(trainerId));
    }
    setExamData(null);
    setStatus('idle');
    setError(null);
    jobIdRef.current = null;
    loadPromiseRef.current = null;
    successFiredRef.current = false;
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
