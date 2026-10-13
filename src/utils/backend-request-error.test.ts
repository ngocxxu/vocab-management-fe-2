import { describe, expect, it } from 'vitest';
import { BackendRequestError, isBackendNotFound } from './backend-request-error';

describe('isBackendNotFound', () => {
  it('is true for a backend 404', () => {
    expect(isBackendNotFound(new BackendRequestError('Not Found', 404, {}))).toBe(true);
  });

  it('is false for other backend statuses', () => {
    expect(isBackendNotFound(new BackendRequestError('Internal Server Error', 500, {}))).toBe(false);
  });

  it('is false for errors that are not backend errors', () => {
    expect(isBackendNotFound(new Error('Not Found'))).toBe(false);
    expect(isBackendNotFound('404')).toBe(false);
  });
});
