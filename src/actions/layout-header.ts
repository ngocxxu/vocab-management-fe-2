'use server';

import type { ResponseAPI } from '@/types';
import type { TNotification, TUnreadCountResponse } from '@/types/notification';
import type { TPlan } from '@/types/plan';
import { getLayoutNotificationsData } from '@/features/notifications/services/server/getLayoutNotificationsData';
import { getPlans } from './plans';
import { requireAuth } from './auth';

type TLayoutHeaderData = {
  currentPlan: TPlan | null;
  allNotifications?: ResponseAPI<TNotification[]>;
  unreadNotifications?: ResponseAPI<TNotification[]>;
  unreadCount?: TUnreadCountResponse;
};

export async function getLayoutHeaderData(): Promise<TLayoutHeaderData> {
  const user = await requireAuth();
  const [notificationsData, plans] = await Promise.all([
    getLayoutNotificationsData(),
    user.role ? getPlans(user.role) : Promise.resolve([]),
  ]);

  return {
    currentPlan: plans[0] ?? null,
    allNotifications: notificationsData.allNotifications,
    unreadNotifications: notificationsData.unreadNotifications,
    unreadCount: notificationsData.unreadCount,
  };
}
