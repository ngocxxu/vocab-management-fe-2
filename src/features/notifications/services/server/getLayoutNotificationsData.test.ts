import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLayoutNotificationsData } from './getLayoutNotificationsData';

const notificationsApi = vi.hoisted(() => ({ getMy: vi.fn(), getUnread: vi.fn(), getUnreadCount: vi.fn() }));
const logger = vi.hoisted(() => ({ error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }));

vi.mock('@/utils/server-api', () => ({ notificationsApi }));
vi.mock('@/libs/Logger', () => ({ logger }));

const LIST = { items: [], statusCode: 200 };
const COUNT = { count: 2 };

describe('getLayoutNotificationsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns every list and no error when all fetches succeed', async () => {
    notificationsApi.getMy.mockResolvedValue(LIST);
    notificationsApi.getUnread.mockResolvedValue(LIST);
    notificationsApi.getUnreadCount.mockResolvedValue(COUNT);

    const result = await getLayoutNotificationsData();

    expect(result).toEqual({
      allNotifications: LIST,
      unreadNotifications: LIST,
      unreadCount: COUNT,
      notificationsError: false,
    });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('reports the error and logs it when one fetch fails, while keeping the lists that loaded', async () => {
    notificationsApi.getMy.mockRejectedValue(new Error('backend down'));
    notificationsApi.getUnread.mockResolvedValue(LIST);
    notificationsApi.getUnreadCount.mockResolvedValue(COUNT);

    const result = await getLayoutNotificationsData();

    expect(result.notificationsError).toBe(true);
    expect(result.allNotifications).toBeUndefined();
    expect(result.unreadNotifications).toEqual(LIST);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('reports the error when every fetch fails, so a failure never looks like an empty inbox', async () => {
    notificationsApi.getMy.mockRejectedValue(new Error('backend down'));
    notificationsApi.getUnread.mockRejectedValue(new Error('backend down'));
    notificationsApi.getUnreadCount.mockRejectedValue(new Error('backend down'));

    const result = await getLayoutNotificationsData();

    expect(result.notificationsError).toBe(true);
    expect(result.allNotifications).toBeUndefined();
    expect(result.unreadNotifications).toBeUndefined();
    expect(result.unreadCount).toBeUndefined();
  });
});
