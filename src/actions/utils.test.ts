import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackendRequestError } from '@/utils/backend-request-error';
import { toActionError } from './utils';

const translations: Record<string, string> = {
  'status.server': 'Server text',
  'status.tooManyRequests': 'Rate text',
  'createLanguage': 'Failed text',
};

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => translations[key] ?? key),
}));

function backendError(statusCode: number, message: string | string[]): BackendRequestError {
  return new BackendRequestError('backend', statusCode, {
    statusCode,
    message,
    error: 'Error',
    timestamp: '2026-10-10T00:00:00.000Z',
    path: '/x',
  });
}

describe('toActionError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the backend message for a client error, so the specific problem stays visible', async () => {
    const error = await toActionError(backendError(401, 'Invalid credentials'), 'createLanguage');

    expect(error.message).toBe('Invalid credentials');
  });

  it('joins a list of backend validation messages', async () => {
    const error = await toActionError(backendError(400, ['name is required', 'code is invalid']), 'createLanguage');

    expect(error.message).toBe('name is required, code is invalid');
  });

  it('replaces a server error with the translated generic text', async () => {
    const error = await toActionError(backendError(500, 'database exploded'), 'createLanguage');

    expect(error.message).toBe('Server text');
  });

  it('replaces a rate limit with the translated generic text', async () => {
    const error = await toActionError(backendError(429, 'slow down'), 'createLanguage');

    expect(error.message).toBe('Rate text');
  });

  it('passes through a plain Error unchanged', async () => {
    const original = new Error('Unauthorized');

    expect(await toActionError(original, 'createLanguage')).toBe(original);
  });

  it('uses the translated fallback for an unknown value', async () => {
    const error = await toActionError('boom', 'createLanguage');

    expect(error.message).toBe('Failed text');
  });
});
