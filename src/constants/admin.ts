// Role and sort values the admin users table accepts. The TypeScript types are derived from these lists.
export const ADMIN_USER_ROLES = ['ADMIN', 'MEMBER', 'GUEST'] as const;

export const ADMIN_USER_SORT_FIELDS = ['createdAt', 'email'] as const;

// Plan limits: -1 means unlimited. The cap is an int32, the same bound the BE accepts.
export const ADMIN_PLAN_UNLIMITED = -1;
export const ADMIN_PLAN_MAX_LIMIT = 2_147_483_647;

// The limits a plan sets in the form. requestsPerMinute is stored by the BE but never edited here.
export const ADMIN_PLAN_LIMIT_KEYS = ['vocabPerDay', 'languageFolders', 'subjects'] as const;
