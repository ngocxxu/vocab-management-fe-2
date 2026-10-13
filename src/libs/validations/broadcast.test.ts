import { describe, expect, it } from 'vitest';
import { broadcastFormSchema } from './broadcast';

// datetime-local values, as the browser sends them: no time zone, so far from "now" in either direction.
const FUTURE = '2099-01-01T10:00';
const PAST = '2000-01-01T10:00';

const form = (overrides: Record<string, unknown> = {}) => ({
  message: 'Maintenance tonight',
  priority: 'HIGH',
  expiresAt: FUTURE,
  target: 'ALL',
  userIds: [],
  ...overrides,
});

const failedPaths = (overrides: Record<string, unknown>) => {
  const result = broadcastFormSchema.safeParse(form(overrides));

  return result.success ? [] : result.error.issues.map(issue => issue.path.join('.'));
};

describe('broadcastFormSchema', () => {
  it('accepts an all-users broadcast with a message, priority and future expiry', () => {
    expect(broadcastFormSchema.safeParse(form()).success).toBe(true);
  });

  it('accepts a message of exactly 500 characters', () => {
    expect(broadcastFormSchema.safeParse(form({ message: 'a'.repeat(500) })).success).toBe(true);
  });

  it('rejects a message over 500 characters', () => {
    expect(failedPaths({ message: 'a'.repeat(501) })).toContain('message');
  });

  it('rejects a message that is only spaces', () => {
    expect(failedPaths({ message: '   ' })).toContain('message');
  });

  it('rejects a priority outside LOW, MEDIUM and HIGH', () => {
    expect(failedPaths({ priority: 'URGENT' })).toContain('priority');
  });

  it('rejects an expiry in the past', () => {
    expect(failedPaths({ expiresAt: PAST })).toContain('expiresAt');
  });

  it('rejects an expiry that is not a date', () => {
    expect(failedPaths({ expiresAt: 'soon' })).toContain('expiresAt');
  });

  it('requires a role for a role broadcast', () => {
    expect(failedPaths({ target: 'ROLE' })).toContain('role');
  });

  it('accepts a role broadcast with a role', () => {
    expect(broadcastFormSchema.safeParse(form({ target: 'ROLE', role: 'MEMBER' })).success).toBe(true);
  });

  it('requires at least one user for a users broadcast', () => {
    expect(failedPaths({ target: 'USERS', userIds: [] })).toContain('userIds');
  });

  it('accepts a users broadcast with user IDs', () => {
    expect(broadcastFormSchema.safeParse(form({ target: 'USERS', userIds: ['user-1'] })).success).toBe(true);
  });
});
