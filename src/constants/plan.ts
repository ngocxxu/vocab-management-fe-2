export const PlanDisplayName: Record<string, string> = {
  GUEST: 'Free',
  MEMBER: 'Pro',
  ADMIN: 'Admin',
} as const;

export function getPlanDisplayName(role: string): string {
  return PlanDisplayName[role] ?? role;
}

const PlanBadgeClass: Record<string, string> = {
  GUEST: 'plan-badge-free',
  MEMBER: 'plan-badge-pro',
  ADMIN: 'plan-badge-admin',
};

const PlanTextClass: Record<string, string> = {
  GUEST: 'plan-text-free',
  MEMBER: 'plan-text-pro',
  ADMIN: 'plan-text-admin',
};

export function getPlanBadgeClassName(role: string): string {
  return PlanBadgeClass[role] ?? 'plan-badge-free';
}

export function getPlanTextClassName(role: string): string {
  return PlanTextClass[role] ?? 'plan-text-free';
}
