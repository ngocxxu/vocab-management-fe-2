'use client';

import type { TAudioEvaluationProgress, TExamSubmitResponse, TFillInBlankEvaluationProgress } from '@/types/vocab-trainer';

export type TCachedFillInBlankEvaluation = {
  results: TExamSubmitResponse;
  completedAt: string;
};

export type TCachedAudioEvaluation = {
  transcript?: string;
  markdownReport?: string;
  completedAt: string;
};

const fillInBlankEvaluationCacheKey = (jobId: string): string => `fill_in_blank_evaluation_${jobId}`;
const audioEvaluationCacheKey = (jobId: string): string => `translation_audio_evaluation_${jobId}`;

export const readCachedFillInBlankEvaluation = (jobId: string): TCachedFillInBlankEvaluation | null => {
  const cachedValue = localStorage.getItem(fillInBlankEvaluationCacheKey(jobId));
  if (!cachedValue) {
    return null;
  }

  try {
    return JSON.parse(cachedValue) as TCachedFillInBlankEvaluation;
  } catch {
    localStorage.removeItem(fillInBlankEvaluationCacheKey(jobId));
    return null;
  }
};

export const writeCachedFillInBlankEvaluation = (data: TFillInBlankEvaluationProgress): void => {
  if (data.status !== 'completed' || !data.data?.results) {
    return;
  }

  const cachedValue: TCachedFillInBlankEvaluation = {
    results: {
      status: 'completed',
      results: data.data.results,
    },
    completedAt: data.timestamp,
  };

  localStorage.setItem(fillInBlankEvaluationCacheKey(data.jobId), JSON.stringify(cachedValue));
};

export const clearCachedFillInBlankEvaluation = (jobId: string): void => {
  localStorage.removeItem(fillInBlankEvaluationCacheKey(jobId));
};

export const readCachedAudioEvaluation = (jobId: string): TCachedAudioEvaluation | null => {
  const cachedValue = localStorage.getItem(audioEvaluationCacheKey(jobId));
  if (!cachedValue) {
    return null;
  }

  try {
    return JSON.parse(cachedValue) as TCachedAudioEvaluation;
  } catch {
    localStorage.removeItem(audioEvaluationCacheKey(jobId));
    return null;
  }
};

export const writeCachedAudioEvaluation = (data: TAudioEvaluationProgress): void => {
  if (data.status !== 'completed') {
    return;
  }

  const cachedValue: TCachedAudioEvaluation = {
    transcript: data.data?.transcript,
    markdownReport: data.data?.markdownReport,
    completedAt: data.timestamp,
  };

  localStorage.setItem(audioEvaluationCacheKey(data.jobId), JSON.stringify(cachedValue));
};

export const clearCachedAudioEvaluation = (jobId: string): void => {
  localStorage.removeItem(audioEvaluationCacheKey(jobId));
};
