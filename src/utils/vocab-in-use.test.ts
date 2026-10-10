import { describe, expect, it } from 'vitest';
import { BackendRequestError } from '@/utils/backend-request-error';
import { parseVocabInUse, vocabInUseText } from './vocab-in-use';

function backendError(statusCode: number, message: string | string[]): BackendRequestError {
  return new BackendRequestError(Array.isArray(message) ? message.join(' ') : message, statusCode, {
    statusCode,
    error: statusCode === 409 ? 'Conflict' : 'Error',
    message,
    timestamp: '2026-10-09T00:00:00.000Z',
    path: '/api/v1/vocabs/v1',
  });
}

describe('parseVocabInUse', () => {
  it('reads the trainer count of a single-vocab conflict', () => {
    expect(parseVocabInUse(backendError(409, 'Cannot delete vocab. 2 trainers are using it.'))).toEqual({ kind: 'single', trainerCount: 2 });
  });

  it('reads the blocked count of a bulk conflict', () => {
    expect(parseVocabInUse(backendError(409, 'Cannot delete 3 vocabs. 3 vocabs are in use by trainers.'))).toEqual({ kind: 'bulk', blockedCount: 3 });
  });

  it('reads a message that the backend sent as an array', () => {
    expect(parseVocabInUse(backendError(409, ['Cannot delete vocab. 4 trainers are using it.']))).toEqual({ kind: 'single', trainerCount: 4 });
  });

  it('returns null for another 409, so the generic error still shows', () => {
    expect(parseVocabInUse(backendError(409, 'Cannot delete subject. 2 vocabs are using it.'))).toBeNull();
  });

  it('returns null for other status codes, even with a matching message', () => {
    expect(parseVocabInUse(backendError(500, 'Cannot delete vocab. 2 trainers are using it.'))).toBeNull();
  });

  it('returns null for errors that are not from the backend', () => {
    expect(parseVocabInUse(new Error('Cannot delete vocab. 2 trainers are using it.'))).toBeNull();
    expect(parseVocabInUse(undefined)).toBeNull();
  });
});

describe('vocabInUseText', () => {
  it('uses the plural for several trainers', () => {
    expect(vocabInUseText({ kind: 'single', trainerCount: 2 })).toBe('This vocab is used by 2 trainers. Remove it from the trainers first.');
  });

  it('uses the singular for one trainer', () => {
    expect(vocabInUseText({ kind: 'single', trainerCount: 1 })).toBe('This vocab is used by 1 trainer. Remove it from the trainers first.');
  });

  it('says nothing was deleted for a bulk conflict', () => {
    expect(vocabInUseText({ kind: 'bulk', blockedCount: 3 })).toBe('3 vocabs are used by trainers. Remove them from the trainers first. Nothing was deleted.');
  });

  it('uses the singular for one blocked vocab in a bulk delete', () => {
    expect(vocabInUseText({ kind: 'bulk', blockedCount: 1 })).toBe('1 vocab is used by trainers. Remove it from the trainers first. Nothing was deleted.');
  });
});
