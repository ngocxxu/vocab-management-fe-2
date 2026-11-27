import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackendRequestError } from '@/utils/backend-request-error';
import { deleteSubject } from './subjects';

const { deleteSubjectApi, revalidatePathMock } = vi.hoisted(() => ({
  deleteSubjectApi: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }));
vi.mock('@/utils/server-api', () => ({ subjectsApi: { delete: deleteSubjectApi } }));

// Same shape the backend sends for SubjectInUseException (409).
const subjectInUseBody = {
  statusCode: 409,
  error: 'SubjectInUse',
  message: 'Cannot delete subject. 3 vocabs are using it.',
  timestamp: '2026-11-27T00:00:00.000Z',
  path: '/api/v1/subjects/subject-1',
};

describe('deleteSubject', () => {
  beforeEach(() => {
    deleteSubjectApi.mockReset();
    revalidatePathMock.mockReset();
  });

  it('returns CONFLICT with the vocabulary count when the subject is still used', async () => {
    deleteSubjectApi.mockRejectedValue(new BackendRequestError('Conflict', 409, subjectInUseBody));

    await expect(deleteSubject('subject-1')).resolves.toEqual({ ok: false, code: 'CONFLICT', vocabularyCount: 3 });
  });

  it('does not revalidate the subject lists when the delete is refused', async () => {
    deleteSubjectApi.mockRejectedValue(new BackendRequestError('Conflict', 409, subjectInUseBody));

    await deleteSubject('subject-1');

    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it('returns ok and revalidates the subject and word lists after a successful delete', async () => {
    deleteSubjectApi.mockResolvedValue({});

    await expect(deleteSubject('subject-1')).resolves.toEqual({ ok: true });

    expect(revalidatePathMock).toHaveBeenCalledWith('/subjects');
    expect(revalidatePathMock).toHaveBeenCalledWith('/vocab-list');
  });
});
