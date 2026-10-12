// Role and sort values the admin users table accepts. The TypeScript types are derived from these lists.
export const ADMIN_USER_ROLES = ['ADMIN', 'MEMBER', 'GUEST'] as const;

export const ADMIN_USER_SORT_FIELDS = ['createdAt', 'email'] as const;
