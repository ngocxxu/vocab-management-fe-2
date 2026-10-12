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

/** Form input for a language. The code is read-only once the language exists. */
export type TAdminLanguageInput = {
  code: string;
  name: string;
};

export type TAdminWordTypeInput = {
  name: string;
  description: string;
};

/** One language from GET /admin/languages, with how many vocabs and folders use it. */
export type TAdminLanguage = {
  id: string;
  code: string;
  name: string;
  vocabCount: number;
  folderCount: number;
  createdAt: string;
  updatedAt: string;
};

/** One word type from GET /admin/word-types, with how many text targets use it. */
export type TAdminWordType = {
  id: string;
  name: string;
  description: string;
  textTargetCount: number;
  createdAt: string;
  updatedAt: string;
};

/** Who a broadcast reaches. Mirrors the BE BroadcastTarget. */
type TBroadcastTarget = 'ALL' | 'ROLE' | 'USERS';

/** Body of POST /notifications/broadcast. Only the fields the chosen target uses are sent. */
export type TBroadcastPayload = {
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  /** ISO instant. */
  expiresAt: string;
  target: TBroadcastTarget;
  role?: TAdminUserRole;
  userIds?: string[];
};

/** Reply to POST /notifications/broadcast. The recipient list is never returned. */
export type TBroadcastResult = {
  count: number;
};

/** One row from GET /notifications/broadcasts. The recipient count stands in for the list. */
export type TBroadcastHistoryItem = {
  id: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isActive: boolean;
  /** ISO date string as sent by the API. */
  expiresAt: string;
  createdAt: string;
  recipientCount: number;
};
