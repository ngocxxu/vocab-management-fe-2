import type { ADMIN_USER_ROLES, ADMIN_USER_SORT_FIELDS } from '@/constants/admin';

// Mirrors the backend admin responses (GET /admin/stats, /admin/users). Keep in step with the BE DTOs.
export type TAdminUserRole = (typeof ADMIN_USER_ROLES)[number];

export type TAdminUsersSortBy = (typeof ADMIN_USER_SORT_FIELDS)[number];

type TAdminStatsSignupDay = {
  /** YYYY-MM-DD, UTC. */
  date: string;
  count: number;
};

export type TAdminStats = {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<TAdminUserRole, number>;
    new7d: number;
    new30d: number;
  };
  /** Exactly 30 entries, oldest first, zero-filled. */
  signupsDaily: TAdminStatsSignupDay[];
  content: {
    vocabs: number;
    trainers: number;
    examResults: number;
    reviews7d: number;
  };
  ops: {
    jobFailures24h: number;
  };
};

export type TAdminUser = {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: TAdminUserRole;
  isActive: boolean;
  /** ISO date string as sent by the API. */
  createdAt: string;
  updatedAt: string;
  supabaseUserId: string;
  hasPassword: boolean;
};

export type TAdminUsersQuery = {
  page: number;
  pageSize: number;
  q?: string;
  role?: TAdminUserRole;
  isActive?: boolean;
  sortBy: TAdminUsersSortBy;
  sortOrder: 'asc' | 'desc';
};

/** At least one field is sent; the BE rejects an empty change. */
export type TUpdateAdminUserInput = {
  role?: TAdminUserRole;
  isActive?: boolean;
};

type TAdminPlanLimits = {
  /** -1 means unlimited. */
  vocabPerDay: number;
  languageFolders: number;
  subjects: number;
  /** Stored by the BE and never shown in the form. Absent on a plan created from the form. */
  requestsPerMinute?: number;
};

/** One plan row from GET /admin/plans, inactive plans included. */
export type TAdminPlan = {
  id: string;
  role: TAdminUserRole;
  name: string;
  price: number | null;
  priceLabel: string;
  limits: TAdminPlanLimits;
  features: string[];
  stripePriceId: string | null;
  sortOrder: number;
  isActive: boolean;
};

/** Edit form state. Features are the textarea text, one per line. */
export type TAdminPlanFormValues = {
  name: string;
  priceLabel: string;
  price: number | null;
  limits: Omit<TAdminPlanLimits, 'requestsPerMinute'>;
  featuresText: string;
  stripePriceId: string;
  sortOrder: number;
  isActive: boolean;
};

/** The fields a plan write sends. The BE replaces the whole limits object, so a full write must carry requestsPerMinute. */
export type TAdminPlanPayload = Omit<TAdminPlan, 'id' | 'role'>;

export type TCreateAdminPlanInput = TAdminPlanPayload & { role: TAdminUserRole };

/** At least one field is sent; the BE rejects an empty change. */
export type TUpdateAdminPlanInput = Partial<TAdminPlanPayload>;
