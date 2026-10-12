import { describe, expect, it } from 'vitest';
import { buildAdminUsersSearch, formatAdminUserName, isDeleteConfirmed, parseAdminUsersQuery } from './admin-users-query';

describe('parseAdminUsersQuery', () => {
  it('uses the defaults when the URL has no filters', () => {
    expect(parseAdminUsersQuery({})).toEqual({
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('reads every filter and sort from the URL', () => {
    expect(parseAdminUsersQuery({
      page: '3',
      pageSize: '25',
      q: '  ada ',
      role: 'ADMIN',
      isActive: 'false',
      sortBy: 'email',
      sortOrder: 'asc',
    })).toEqual({
      page: 3,
      pageSize: 25,
      q: 'ada',
      role: 'ADMIN',
      isActive: false,
      sortBy: 'email',
      sortOrder: 'asc',
    });
  });

  it('falls back to defaults for out-of-range or unknown values', () => {
    expect(parseAdminUsersQuery({
      page: '0',
      pageSize: '500',
      role: 'ROOT',
      isActive: 'maybe',
      sortBy: 'password',
      sortOrder: 'up',
    })).toEqual({
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('ignores repeated parameters and non-numeric pages', () => {
    expect(parseAdminUsersQuery({ q: ['a', 'b'], page: 'abc' })).toEqual({
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('drops an empty search instead of sending q=', () => {
    expect(parseAdminUsersQuery({ q: '   ' })).not.toHaveProperty('q');
  });
});

describe('isDeleteConfirmed', () => {
  it('is true only when the typed text equals the email exactly', () => {
    expect(isDeleteConfirmed('ada@example.com', 'ada@example.com')).toBe(true);
  });

  it('is false for a different case, surrounding spaces or an empty input', () => {
    expect(isDeleteConfirmed('ADA@example.com', 'ada@example.com')).toBe(false);
    expect(isDeleteConfirmed(' ada@example.com', 'ada@example.com')).toBe(false);
    expect(isDeleteConfirmed('', 'ada@example.com')).toBe(false);
  });
});

describe('formatAdminUserName', () => {
  it('joins first and last name with one space', () => {
    expect(formatAdminUserName({ firstName: 'Ada', lastName: 'Lovelace' })).toBe('Ada Lovelace');
  });
});

describe('buildAdminUsersSearch', () => {
  it('resets to page 1 when a filter changes, so the page never points past the results', () => {
    const next = new URLSearchParams(buildAdminUsersSearch(new URLSearchParams('page=4&q=a'), { q: 'bob' }));

    expect(next.get('page')).toBe('1');
    expect(next.get('q')).toBe('bob');
  });

  it('resets to page 1 when the sort changes', () => {
    const next = new URLSearchParams(buildAdminUsersSearch(new URLSearchParams('page=4'), { sortBy: 'email', sortOrder: 'asc' }));

    expect(next.get('page')).toBe('1');
    expect(next.get('sortBy')).toBe('email');
  });

  it('keeps the filters when only the page changes', () => {
    const next = new URLSearchParams(buildAdminUsersSearch(new URLSearchParams('q=bob&role=ADMIN'), { page: '2' }));

    expect(next.get('page')).toBe('2');
    expect(next.get('q')).toBe('bob');
    expect(next.get('role')).toBe('ADMIN');
  });

  it('removes a filter when it is cleared', () => {
    const next = new URLSearchParams(buildAdminUsersSearch(new URLSearchParams('role=ADMIN'), { role: undefined }));

    expect(next.has('role')).toBe(false);
  });
});
