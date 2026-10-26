'use server';

import type { ResponseAPI } from '@/types';
import type { TNotification, TUnreadCountResponse } from '@/types/notification';
import type { TPlan } from '@/types/plan';
import { getLayoutNotificationsData } from '@/features/notifications/services/server/getLayoutNotificationsData';
import { logger } from '@/libs/Logger';
import { getPlans } from './plans';
import { requireAuth } from './auth';

type TLayoutHeaderData = {
  currentPlan: TPlan | null;
  allNotifications?: ResponseAPI<TNotification[]>;
  unreadNotifications?: ResponseAPI<TNotification[]>;
  unreadCount?: TUnreadCountResponse;
  notificationsError: boolean;
};

export async function getLayoutHeaderData(): Promise<TLayoutHeaderData> {
  const user = await requireAuth();
  const [notificationsData, plans] = await Promise.all([
    getLayoutNotificationsData(),
    user.role
      ? getPlans(user.role).catch((error: unknown) => {
          // A plan that fails to load must not hide the notifications, so it is logged and the header goes on without it.
          logger.error('Failed to load plans for the layout:', { error });
          return [];
        })
      : Promise.resolve([]),
  ]);

  return {
    currentPlan: plans[0] ?? null,
    allNotifications: notificationsData.allNotifications,
    unreadNotifications: notificationsData.unreadNotifications,
    unreadCount: notificationsData.unreadCount,
    notificationsError: notificationsData.notificationsError,
  };
}
