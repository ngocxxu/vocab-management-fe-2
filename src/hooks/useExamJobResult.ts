'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getExamJobStatus } from '@/actions';
import { useSocket } from '@/hooks/useSocket';
import { logger } from '@/libs/Logger';
import {
  applyExamJobProgress,
  EXAM_JOB_POLL_INTERVAL_MS,
  EXAM_JOB_TIMEOUT_MS,
  initialExamJobState,
  retryExamJob,
  timeoutExamJob,
} from '@/utils/exam-job-result';
import type { TExamJobProgress, TExamJobState } from '@/utils/exam-job-result';

type TSocketProgress = {
  jobId: string;
  status: TExamJobProgress['status'];
  data?: { error?: string } & Record<string, unknown>;
  timestamp?: string;
};

type TUseExamJobResultOptions<TData> = {
  trainerId: string;
  /** Null until the page has read it from storage; nothing is awaited before then. */
  jobId: string | null;
  socketEvent: string;
  isValid: (data: unknown) => data is TData;
  readCached: (jobId: string) => { data: TData; completedAt?: string } | null;
  writeCached: (jobId: string, data: TData, completedAt: string) => void;
};

/**
 * Waits for the result of a grading job and never waits forever.
 * The result can come from the socket event, from the local cache (the event may have landed before this page
 * listened) or from polling the job status (the socket may be down). After EXAM_JOB_TIMEOUT_MS the phase is
 * `timeout`; `retry()` waits again without re-submitting the exam.
 */
export const useExamJobResult = <TData>({ trainerId, jobId, socketEvent, isValid, readCached, writeCached }: TUseExamJobResultOptions<TData>) => {
  const { socket } = useSocket();
  const [state, setState] = useState<TExamJobState<TData>>(() => initialExamJobState<TData>());
  const [attempt, setAttempt] = useState(0);
  const latest = useRef({ isValid, readCached, writeCached });

  useEffect(() => {
    latest.current = { isValid, readCached, writeCached };
  }, [isValid, readCached, writeCached]);

  // The result may already be cached: the event can arrive before this page starts listening.
  useEffect(() => {
    if (!jobId) {
      return;
    }
    const cached = latest.current.readCached(jobId);
    if (cached) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setState(prev => applyExamJobProgress(prev, { status: 'completed', data: cached.data, completedAt: cached.completedAt }, latest.current.isValid));
    }
  }, [jobId]);

  useEffect(() => {
    if (!socket || !jobId) {
      return;
    }

    const handleProgress = (event: TSocketProgress) => {
      if (String(event.jobId) !== jobId) {
        return;
      }
      const progress: TExamJobProgress = { status: event.status, data: event.data, error: event.data?.error, completedAt: event.timestamp };
      setState(prev => applyExamJobProgress(prev, progress, latest.current.isValid));
    };

    socket.on(socketEvent, handleProgress);
    return () => {
      socket.off(socketEvent, handleProgress);
    };
  }, [socket, jobId, socketEvent]);

  // Fallback while waiting: ask the server, and give up after the timeout.
  useEffect(() => {
    if (!jobId || state.phase !== 'loading') {
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const response = await getExamJobStatus(trainerId, jobId);
        if (cancelled) {
          return;
        }
        const completedAt = new Date().toISOString();
        if (response.status === 'completed' && latest.current.isValid(response.data)) {
          latest.current.writeCached(jobId, response.data, completedAt);
        }
        setState(prev => applyExamJobProgress(prev, { status: response.status, data: response.data, error: response.error, completedAt }, latest.current.isValid));
      } catch (error) {
        logger.warn('Exam job status poll failed', { error, jobId });
      }
    };

    void poll();
    const interval = setInterval(() => void poll(), EXAM_JOB_POLL_INTERVAL_MS);
    const timeout = setTimeout(() => setState(prev => timeoutExamJob(prev)), EXAM_JOB_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [jobId, trainerId, state.phase, attempt]);

  const retry = useCallback(() => {
    setState(prev => retryExamJob(prev));
    setAttempt(value => value + 1);
  }, []);

  return { state, retry };
};
