import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TVocabTrainer, TWordResults } from '@/types/vocab-trainer';
import {
  readJobPointer,
  readStoredAudioResult,
  resolveStoredAudioState,
  resolveStoredFillInBlankState,
  toStoredFillInBlankRows,
} from './exam-stored-result';

const audioRow = { id: 'r1', vocabTrainerId: 't1', status: 'PASSED', userSelected: 'hi', systemSelected: 'hello', data: { transcript: 'hi there', markdownReport: '# Report' } } as TWordResults;
const fillInRow = { id: 'r2', vocabTrainerId: 't1', status: 'FAILED', userSelected: 'a', systemSelected: 'b', data: { explanation: 'why' } } as TWordResults;

const trainerWith = (gradingStatus: TVocabTrainer['gradingStatus'], results: TWordResults[] = []) =>
  ({ id: 't1', gradingStatus, results }) as unknown as TVocabTrainer;

describe('readStoredAudioResult', () => {
  it('reads the transcript and report from the audio result row', () => {
    expect(readStoredAudioResult([fillInRow, audioRow])).toEqual({ transcript: 'hi there', markdownReport: '# Report' });
  });

  it('returns null when no row has a transcript', () => {
    expect(readStoredAudioResult([fillInRow])).toBeNull();
  });

  it('returns null when the trainer has no results', () => {
    expect(readStoredAudioResult(undefined)).toBeNull();
    expect(readStoredAudioResult([])).toBeNull();
  });
});

describe('resolveStoredAudioState', () => {
  it('shows the job it waits for while the grading runs', () => {
    expect(resolveStoredAudioState(trainerWith('grading'), 'job-1')).toEqual({ phase: 'grading', jobId: 'job-1' });
  });

  it('marks a grading that this browser cannot follow as grading without a job', () => {
    expect(resolveStoredAudioState(trainerWith('grading'), null)).toEqual({ phase: 'grading', jobId: null });
  });

  it('reports a failed grading so the page can offer a regrade', () => {
    expect(resolveStoredAudioState(trainerWith('grading_failed', [audioRow]), null)).toEqual({ phase: 'failed' });
  });

  it('shows the saved result of a graded submit', () => {
    expect(resolveStoredAudioState(trainerWith('graded', [audioRow]), null)).toEqual({
      phase: 'graded',
      result: { transcript: 'hi there', markdownReport: '# Report' },
    });
  });

  it('reports no result when a graded submit has no audio row', () => {
    expect(resolveStoredAudioState(trainerWith('graded', [fillInRow]), null)).toEqual({ phase: 'none' });
  });

  it('reports no result when there was no AI-graded submit', () => {
    expect(resolveStoredAudioState(trainerWith(null), null)).toEqual({ phase: 'none' });
  });
});

const storedRow = {
  id: 'r3',
  vocabTrainerId: 't1',
  status: 'PASSED',
  userSelected: 'cat',
  systemSelected: 'cat',
  createdAt: '2026-11-23T10:00:00.000Z',
  data: { explanation: 'Correct form.', content: 'The ___ sat on the mat.' },
} as TWordResults;

// A row graded before the question text was stored: no `content` key at all.
const oldRow = { id: 'r4', vocabTrainerId: 't1', status: 'FAILED', userSelected: 'dog', systemSelected: 'cat', data: { explanation: 'Wrong animal.' } } as TWordResults;

describe('toStoredFillInBlankRows', () => {
  it('keeps the question text and the explanation of each stored row', () => {
    expect(toStoredFillInBlankRows([storedRow])).toEqual([
      { id: 'r3', status: 'PASSED', userSelected: 'cat', systemSelected: 'cat', explanation: 'Correct form.', content: 'The ___ sat on the mat.' },
    ]);
  });

  it('gives null content to a row graded before the question text was stored', () => {
    expect(toStoredFillInBlankRows([oldRow])).toEqual([
      { id: 'r4', status: 'FAILED', userSelected: 'dog', systemSelected: 'cat', explanation: 'Wrong animal.', content: null },
    ]);
  });

  it('gives null content when the row has no data or the content is null', () => {
    expect(toStoredFillInBlankRows([{ ...oldRow, data: null } as TWordResults])[0]?.content).toBeNull();
    expect(toStoredFillInBlankRows([{ ...oldRow, data: { content: null } } as TWordResults])[0]?.content).toBeNull();
  });

  it('returns no rows when the trainer has no results', () => {
    expect(toStoredFillInBlankRows(undefined)).toEqual([]);
  });
});

describe('resolveStoredFillInBlankState', () => {
  it('shows the job it waits for while the grading runs', () => {
    expect(resolveStoredFillInBlankState(trainerWith('grading'), 'job-2')).toEqual({ phase: 'grading', jobId: 'job-2' });
  });

  it('reports a failed grading so the page can offer a regrade', () => {
    expect(resolveStoredFillInBlankState(trainerWith('grading_failed', [storedRow]), null)).toEqual({ phase: 'failed' });
  });

  it('shows the stored rows of a graded submit with the time they were graded', () => {
    expect(resolveStoredFillInBlankState(trainerWith('graded', [storedRow, oldRow]), null)).toEqual({
      phase: 'graded',
      rows: toStoredFillInBlankRows([storedRow, oldRow]),
      completedAt: '2026-11-23T10:00:00.000Z',
    });
  });

  it('keeps old rows without content in the graded result', () => {
    const state = resolveStoredFillInBlankState(trainerWith('graded', [oldRow]), null);
    expect(state).toMatchObject({ phase: 'graded', rows: [{ content: null, userSelected: 'dog' }] });
  });

  it('reports no result when the trainer has no rows', () => {
    expect(resolveStoredFillInBlankState(trainerWith('graded', []), null)).toEqual({ phase: 'none' });
    expect(resolveStoredFillInBlankState(trainerWith(null), null)).toEqual({ phase: 'none' });
  });
});

describe('readJobPointer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the job id and the time elapsed that a page saved', () => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => JSON.stringify({ jobId: 'job-9', timeElapsed: 42 })) });
    expect(readJobPointer('fill_in_blank_result_t1')).toEqual({ jobId: 'job-9', timeElapsed: 42 });
  });

  it('returns no job and no time when nothing is saved', () => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null) });
    expect(readJobPointer('fill_in_blank_result_t1')).toEqual({ jobId: null, timeElapsed: null });
  });

  it('returns no job when the saved data cannot be parsed', () => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => '{not json') });
    expect(readJobPointer('fill_in_blank_result_t1')).toEqual({ jobId: null, timeElapsed: null });
  });
});
