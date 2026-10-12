import { ADMIN_USER_ROLES, ADMIN_USER_SORT_FIELDS } from '@/constants/admin';
import type { TAdminUser, TAdminUserRole, TAdminUsersQuery, TAdminUsersSortBy } from '@/types/admin';

type TSearchParams = Record<string, string | string[] | undefined>;

/** URL keys the users table writes. The keys are the query fields, so a typo cannot reach the URL. */
export type TAdminUsersUrlUpdate = Partial<Record<keyof TAdminUsersQuery, string | undefined>>;

const DEFAULT_SORT_BY: TAdminUsersSortBy = 'createdAt';
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const MAX_SEARCH_LENGTH = 100;

// Repeated parameters (?q=a&q=b) arrive as arrays; they are ignored rather than guessed at.
const readText = (value: string | string[] | undefined): string | undefined => (typeof value === 'string' ? value : undefined);

const readPositiveInt = (value: string | string[] | undefined, fallback: number, max = Number.MAX_SAFE_INTEGER): number => {
  const text = readText(value);
  const number = Number(text);
  return text !== undefined && Number.isInteger(number) && number >= 1 && number <= max ? number : fallback;
};

const readSearch = (value: string | string[] | undefined): string | undefined => {
  const text = readText(value)?.trim().slice(0, MAX_SEARCH_LENGTH);
  return text || undefined;
};

const readRole = (value: string | string[] | undefined): TAdminUserRole | undefined => ADMIN_USER_ROLES.find(role => role === readText(value));

const readSortBy = (value: string | string[] | undefined): TAdminUsersSortBy => ADMIN_USER_SORT_FIELDS.find(field => field === readText(value)) ?? DEFAULT_SORT_BY;

const readIsActive = (value: string | string[] | undefined): boolean | undefined => {
  const text = readText(value);
  if (text === 'true') {
    return true;
  }
  if (text === 'false') {
    return false;
  }
  return undefined;
};

/** Reads the users page filters from the URL. Anything unknown falls back to the default. */
export function parseAdminUsersQuery(params: TSearchParams): TAdminUsersQuery {
  const q = readSearch(params.q);
  const role = readRole(params.role);
  const isActive = readIsActive(params.isActive);

  return {
    page: readPositiveInt(params.page, 1),
    pageSize: readPositiveInt(params.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    sortBy: readSortBy(params.sortBy),
    sortOrder: readText(params.sortOrder) === 'asc' ? 'asc' : 'desc',
    ...(q !== undefined && { q }),
    ...(role !== undefined && { role }),
    ...(isActive !== undefined && { isActive }),
  };
}

/** The delete dialog unlocks only on an exact match with the user's email. */
export function isDeleteConfirmed(typed: string, email: string): boolean {
  return typed === email;
}

export function formatAdminUserName(user: Pick<TAdminUser, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`;
}

/**
 * Builds the table's query string with `updates` applied. Changing a filter or sort resets to page 1,
 * so the page never points past the end of the new results. A page change keeps the filters.
 */
export function buildAdminUsersSearch(current: URLSearchParams, updates: TAdminUsersUrlUpdate): string {
  const next = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  const changesQuery = Object.keys(updates).some(key => key !== 'page');
  if (changesQuery && !('page' in updates)) {
    next.set('page', '1');
  }

  return next.toString();
}
