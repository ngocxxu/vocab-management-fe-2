import { UserRole } from '@/constants/auth';

/** Admin check on the role the backend returns. Comparison is exact: a lowercase role never grants access. */
export function isAdmin(user?: { role?: string } | null): boolean {
  return user?.role === UserRole.ADMIN;
}
