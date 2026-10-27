import type { TUser } from '@/types/auth';
import type { TMcpReadiness } from '@/types/connect-ai';

// Mirrors the backend MCP guard: GUEST (Free plan) gets mcp_requires_plan, and an admin switch-off gets mcp_access_disabled.
// The flag defaults to on, so only an explicit false counts as disabled.
export function getMcpReadiness(user: Pick<TUser, 'role' | 'mcpAccess'>, serverUrl: string | undefined): TMcpReadiness {
  return {
    plan: user.role === 'GUEST' ? 'locked' : 'ok',
    access: user.mcpAccess === false ? 'disabled' : 'ok',
    server: serverUrl?.trim() ? 'ok' : 'missing',
  };
}
