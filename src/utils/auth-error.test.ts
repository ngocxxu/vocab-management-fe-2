import { describe, expect, it } from 'vitest';
import { getExpiredSessionRedirect, hasUnauthorizedError, isUnauthorizedError } from '@/utils/auth-error';
import { BackendRequestError } from '@/utils/backend-request-error';

describe('isUnauthorizedError', () => {
  it('is true for BackendRequestError with 401 or 403', () => {
    expect(isUnauthorizedError(new BackendRequestError('x', 401, null))).toBe(true);
    expect(isUnauthorizedError(new BackendRequestError('x', 403, null))).toBe(true);
  });

  it('is false for other BackendRequestError statuses', () => {
    expect(isUnauthorizedError(new BackendRequestError('x', 500, null))).toBe(false);
    expect(isUnauthorizedError(new BackendRequestError('x', 404, null))).toBe(false);
  });

  it('reads statusCode and status from plain objects', () => {
    expect(isUnauthorizedError({ statusCode: 401 })).toBe(true);
    expect(isUnauthorizedError({ status: 403 })).toBe(true);
    expect(isUnauthorizedError({ status: 500 })).toBe(false);
  });

  it('recognises the Unauthorized Error message from requireAuth', () => {
    expect(isUnauthorizedError(new Error('Unauthorized'))).toBe(true);
    expect(isUnauthorizedError(new Error('Something else'))).toBe(false);
  });

  it('is false for null, undefined and primitives', () => {
    expect(isUnauthorizedError(null)).toBe(false);
    expect(isUnauthorizedError(undefined)).toBe(false);
    expect(isUnauthorizedError('Unauthorized')).toBe(false);
  });
});

describe('hasUnauthorizedError', () => {
  it('is true when any error is unauthorized', () => {
    expect(hasUnauthorizedError([undefined, new Error('boom'), { status: 401 }])).toBe(true);
  });

  it('is false for an empty list or unrelated errors', () => {
    expect(hasUnauthorizedError([])).toBe(false);
    expect(hasUnauthorizedError([undefined, new Error('boom')])).toBe(false);
  });
});

describe('getExpiredSessionRedirect', () => {
  it('builds a signin URL with an encoded redirect and expired flag', () => {
    expect(getExpiredSessionRedirect('/vocab-list')).toBe('/signin?redirect=%2Fvocab-list&expired=1');
  });

  it('keeps a query string inside the encoded redirect', () => {
    expect(getExpiredSessionRedirect('/a?b=1&c=2')).toBe('/signin?redirect=%2Fa%3Fb%3D1%26c%3D2&expired=1');
  });
});
