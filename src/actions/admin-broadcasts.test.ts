import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdminBroadcast, setAdminBroadcastActive } from './admin-broadcasts';

const revalidatePath = vi.hoisted(() => vi.fn());
const requireAdmin = vi.hoisted(() => vi.fn());
const notificationsApi = vi.hoisted(() => ({ broadcast: vi.fn(), setActive: vi.fn() }));

vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('./auth', () => ({ requireAdmin }));
vi.mock('./utils', () => ({
  toActionError: vi.fn(async (_error: unknown, key: string) => new Error(key)),
  translateError: vi.fn(async (key: string) => key),
}));
vi.mock('@/utils/server-api', () => ({ notificationsApi, adminApi: {} }));

const FORM = {
  message: 'Maintenance tonight',
  priority: 'HIGH' as const,
  expiresAt: '2099-01-01T10:00',
  target: 'USERS' as const,
  role: undefined,
  userIds: ['user-1'],
};

describe('admin broadcast actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockResolvedValue(undefined);
  });

  it('sends the mapped payload and refreshes the history and the bells', async () => {
    notificationsApi.broadcast.mockResolvedValue({ count: 1 });

    const result = await createAdminBroadcast(FORM);

    expect(notificationsApi.broadcast).toHaveBeenCalledWith({
      message: 'Maintenance tonight',
      priority: 'HIGH',
      expiresAt: new Date(2099, 0, 1, 10, 0).toISOString(),
      target: 'USERS',
      userIds: ['user-1'],
    });
    expect(result).toEqual({ count: 1 });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/broadcasts');
    expect(revalidatePath).toHaveBeenCalledWith('/notifications');
  });

  it('rejects an invalid form before calling the API', async () => {
    await expect(createAdminBroadcast({ ...FORM, message: '   ' })).rejects.toThrow('adminInvalidInput');

    expect(notificationsApi.broadcast).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('does not refresh when the API refuses the broadcast', async () => {
    notificationsApi.broadcast.mockRejectedValue(new Error('No active users match this broadcast target'));

    await expect(createAdminBroadcast(FORM)).rejects.toThrow('adminSendBroadcast');

    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('checks the admin role before anything else', async () => {
    requireAdmin.mockRejectedValue(new Error('Forbidden'));

    await expect(createAdminBroadcast(FORM)).rejects.toThrow('Forbidden');

    expect(notificationsApi.broadcast).not.toHaveBeenCalled();
  });

  it('turns a broadcast off and refreshes the history', async () => {
    notificationsApi.setActive.mockResolvedValue({ id: 'n1', isActive: false });

    await setAdminBroadcastActive('n1', false);

    expect(notificationsApi.setActive).toHaveBeenCalledWith('n1', false);
    expect(revalidatePath).toHaveBeenCalledWith('/admin/broadcasts');
  });
});
