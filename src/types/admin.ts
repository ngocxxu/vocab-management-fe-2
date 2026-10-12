// Mirrors the backend AdminStatsDto (GET /admin/stats). Keep in step with the BE response.
type TAdminStatsRole = 'ADMIN' | 'MEMBER' | 'GUEST';

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
    byRole: Record<TAdminStatsRole, number>;
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
