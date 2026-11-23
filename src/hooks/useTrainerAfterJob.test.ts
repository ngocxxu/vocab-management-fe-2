// @vitest-environment jsdom
import type { TVocabTrainer } from '@/types/vocab-trainer';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTrainerAfterJob } from './useTrainerAfterJob';

const { reloadVocabTrainer, logWarn } = vi.hoisted(() => ({ reloadVocabTrainer: vi.fn(), logWarn: vi.fn() }));

vi.mock('@/actions/vocab-trainers', () => ({ reloadVocabTrainer }));
vi.mock('@/libs/Logger', () => ({ logger: { warn: logWarn } }));

const trainer = { id: 'trainer-1', name: 'Verbs', reminderPromptPending: false } as unknown as TVocabTrainer;
const pending = { ...trainer, reminderPromptPending: true } as TVocabTrainer;

describe('useTrainerAfterJob', () => {
  beforeEach(() => {
    reloadVocabTrainer.mockReset();
    logWarn.mockReset();
  });

  it('waits and does not reload before the AI job is done', () => {
    const { result } = renderHook(({ done }) => useTrainerAfterJob('trainer-1', done), { initialProps: { done: false } });

    expect(result.current.phase).toBe('waiting');
    expect(reloadVocabTrainer).not.toHaveBeenCalled();
  });

  it('reloads once after the job is done and reports a completed trainer as gone', async () => {
    reloadVocabTrainer.mockResolvedValue({ kind: 'gone' });
    const { result, rerender } = renderHook(({ done }) => useTrainerAfterJob('trainer-1', done), { initialProps: { done: false } });

    rerender({ done: true });

    await waitFor(() => expect(result.current.phase).toBe('gone'));
    expect(reloadVocabTrainer).toHaveBeenCalledTimes(1);
    expect(reloadVocabTrainer).toHaveBeenCalledWith('trainer-1');
  });

  it('opens the prompt when the reloaded trainer has one pending', async () => {
    reloadVocabTrainer.mockResolvedValue({ kind: 'found', trainer: pending });
    const { result, rerender } = renderHook(({ done }) => useTrainerAfterJob('trainer-1', done), { initialProps: { done: false } });

    rerender({ done: true });

    await waitFor(() => expect(result.current.phase).toBe('loaded'));
    expect(result.current.trainer).toEqual(pending);
    expect(result.current.isPromptOpen).toBe(true);
  });

  it('keeps the prompt closed when no prompt is pending', async () => {
    reloadVocabTrainer.mockResolvedValue({ kind: 'found', trainer });
    const { result, rerender } = renderHook(({ done }) => useTrainerAfterJob('trainer-1', done), { initialProps: { done: false } });

    rerender({ done: true });

    await waitFor(() => expect(result.current.phase).toBe('loaded'));
    expect(result.current.isPromptOpen).toBe(false);
  });

  it('closes the prompt without answering it, and keeps the trainer loaded', async () => {
    reloadVocabTrainer.mockResolvedValue({ kind: 'found', trainer: pending });
    const { result, rerender } = renderHook(({ done }) => useTrainerAfterJob('trainer-1', done), { initialProps: { done: false } });
    rerender({ done: true });
    await waitFor(() => expect(result.current.isPromptOpen).toBe(true));

    act(() => result.current.dismissPrompt());

    expect(result.current.isPromptOpen).toBe(false);
    expect(result.current.phase).toBe('loaded');
  });

  it('closes the prompt once the answer comes back with no prompt pending', async () => {
    reloadVocabTrainer.mockResolvedValue({ kind: 'found', trainer: pending });
    const { result, rerender } = renderHook(({ done }) => useTrainerAfterJob('trainer-1', done), { initialProps: { done: false } });
    rerender({ done: true });
    await waitFor(() => expect(result.current.isPromptOpen).toBe(true));

    act(() => result.current.onTrainerChange(trainer));

    expect(result.current.trainer).toEqual(trainer);
    expect(result.current.isPromptOpen).toBe(false);
  });

  it('reports unavailable when the reload fails, so the results can still show without the prompt', async () => {
    reloadVocabTrainer.mockRejectedValue(new Error('Network down'));
    const { result, rerender } = renderHook(({ done }) => useTrainerAfterJob('trainer-1', done), { initialProps: { done: false } });

    rerender({ done: true });

    await waitFor(() => expect(result.current.phase).toBe('unavailable'));
    expect(result.current.isPromptOpen).toBe(false);
    expect(logWarn).toHaveBeenCalled();
  });
});
