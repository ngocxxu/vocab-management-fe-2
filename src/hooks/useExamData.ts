'use client';

import type { TExamGenerationProgress, TQuestion, TQuestionAPI } from '@/types/vocab-trainer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getExam, getExamJobStatus } from '@/actions';
import { EQuestionType } from '@/enum/vocab-trainer';
import { useSocket } from '@/hooks/useSocket';
import { logger } from '@/libs/Logger';
import { EXAM_JOB_POLL_INTERVAL_MS, EXAM_JOB_TIMEOUT_MS } from '@/utils/exam-job-result';
import { SOCKET_EVENTS } from '@/utils/socket-config';

// --- Storage helpers ---
const getStorageKey = (id: string) => `exam_data_${id}`;

const loadCachedData = (id: string): TQuestionAPI | null => {
  const storageKey = getStorageKey(id);
  try {
    const cached = localStorage.getItem(storageKey);
    return cached ? JSON.parse(cached) : null;
  } catch {
    localStorage.removeItem(storageKey);
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
  const [status, setStatus] = useState<GenerationStatus>(() => autoLoad && trainerId ? 'generating' : 'idle');
  const [error, setError] = useState<unknown>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const { socket } = useSocket();

  // Refs that never need to trigger a re-render
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

  // Clear cached exam data for this trainer when the consumer unmounts
  useEffect(() => {
    return () => {
      if (trainerId) {
        localStorage.removeItem(getStorageKey(trainerId));
      }
    };
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
        setJobId(data.jobId || trainerId);

        if (!socket?.connected) {
          logger.warn('Socket not connected, waiting for connection...', { trainerId });
        }
      } catch (err) {
        logger.error('Fetch error:', { error: err, trainerId });
        localStorage.removeItem(getStorageKey(trainerId));
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

  // Applies news about the generation job, whether it came from the socket or from polling the job status.
  const settleGeneration = useCallback((progress: { status: string; data?: { questions?: TQuestion[]; error?: string }; error?: string }) => {
    if (progress.status === 'failed') {
      const errMsg = progress.data?.error || progress.error || 'Generation failed';
      setError(errMsg);
      setStatus('failed');
      latestActions.current.onErrorAction?.(new Error(errMsg));
      return;
    }

    if (progress.status === 'completed' && progress.data?.questions) {
      const completedData: TQuestionAPI = {
        ...examData!,
        questionAnswers: progress.data.questions,
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
  }, [examData]);

  // Socket listener — only active while generating
  useEffect(() => {
    if (!socket || !jobId || status !== 'generating') {
      return;
    }

    const handleProgress = (event: TExamGenerationProgress) => {
      if (String(event.jobId) !== jobId) {
        return;
      }
      settleGeneration(event);
    };

    socket.on(SOCKET_EVENTS.MULTIPLE_CHOICE_GENERATION_PROGRESS, handleProgress);
    socket.on(SOCKET_EVENTS.FILL_IN_BLANK_CHOICE_GENERATION_PROGRESS, handleProgress);
    return () => {
      socket.off(SOCKET_EVENTS.MULTIPLE_CHOICE_GENERATION_PROGRESS, handleProgress);
      socket.off(SOCKET_EVENTS.FILL_IN_BLANK_CHOICE_GENERATION_PROGRESS, handleProgress);
    };
  }, [socket, jobId, status, settleGeneration]);

  // Fallback while generating: the socket event may never arrive, so ask the server and give up after the timeout.
  useEffect(() => {
    if (!trainerId || !jobId || status !== 'generating') {
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const response = await getExamJobStatus(trainerId, jobId);
        if (!cancelled) {
          settleGeneration({ status: response.status, data: response.data as { questions?: TQuestion[] } | undefined, error: response.error });
        }
      } catch (err) {
        logger.warn('Exam generation status poll failed', { error: err, trainerId, jobId });
      }
    };

    void poll();
    const interval = setInterval(() => void poll(), EXAM_JOB_POLL_INTERVAL_MS);
    const timeout = setTimeout(() => {
      settleGeneration({ status: 'failed', error: 'Generating the questions is taking longer than expected' });
    }, EXAM_JOB_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [trainerId, jobId, status, settleGeneration]);

  // Auto-load
  useEffect(() => {
    if (autoLoad && trainerId) {
      setStatus('generating');
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
    setJobId(null);
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
