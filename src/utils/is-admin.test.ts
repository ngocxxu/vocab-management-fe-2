import { describe, expect, it } from 'vitest';
import { isAdmin } from './is-admin';

describe('isAdmin', () => {
  it('is true only for the ADMIN role', () => {
    expect(isAdmin({ role: 'ADMIN' })).toBe(true);
  });

  it('is false for MEMBER and GUEST', () => {
    expect(isAdmin({ role: 'MEMBER' })).toBe(false);
    expect(isAdmin({ role: 'GUEST' })).toBe(false);
  });

  it('is false when there is no user', () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });

  it('is false when the user has no role', () => {
    expect(isAdmin({})).toBe(false);
  });

  it('is case-sensitive, so a lowercase role does not grant access', () => {
    expect(isAdmin({ role: 'admin' })).toBe(false);
  });
});
