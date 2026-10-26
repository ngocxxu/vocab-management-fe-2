import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateAdminUser } from './admin';

const revalidatePath = vi.hoisted(() => vi.fn());
const requireAdmin = vi.hoisted(() => vi.fn());
const usersApi = vi.hoisted(() => ({ update: vi.fn(), remove: vi.fn() }));

vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('./auth', () => ({ requireAdmin }));
vi.mock('./utils', () => ({
  toActionError: vi.fn(async (_error: unknown, key: string) => new Error(key)),
  translateError: vi.fn(async (key: string) => key),
}));
vi.mock('@/utils/server-api', () => ({ adminApi: { users: usersApi } }));

const USER_ID = 'user-1';

describe('updateAdminUser MCP access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockResolvedValue(undefined);
  });

  it('turns MCP access on and refreshes the users pages', async () => {
    usersApi.update.mockResolvedValue({ id: USER_ID, mcpAccess: true });

    await updateAdminUser(USER_ID, { mcpAccess: true });

    expect(usersApi.update).toHaveBeenCalledWith(USER_ID, { mcpAccess: true });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/users');
  });

  it('turns MCP access off', async () => {
    usersApi.update.mockResolvedValue({ id: USER_ID, mcpAccess: false });

    await updateAdminUser(USER_ID, { mcpAccess: false });

    expect(usersApi.update).toHaveBeenCalledWith(USER_ID, { mcpAccess: false });
  });

  it('does not call the API for an empty change', async () => {
    await expect(updateAdminUser(USER_ID, {})).rejects.toThrow('adminInvalidInput');

    expect(usersApi.update).not.toHaveBeenCalled();
  });
});
