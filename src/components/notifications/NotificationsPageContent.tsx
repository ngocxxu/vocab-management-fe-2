'use client';

import type { NotificationsPageContentProps, NotificationWithRead } from '@/types/notification';
import { Bell, VolumeLoud } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from './NotificationItem';
import { NotificationsSidebar } from './NotificationsSidebar';
import { groupNotificationsByDate } from './utils';

function Section({
  label,
  items,
  onMarkAsRead,
}: Readonly<{
  label: string;
  items: NotificationWithRead[];
  onMarkAsRead: () => void;
}>) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 first:mt-0">
      <h2 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </h2>
      <div className="space-y-3">
        {items.map(({ notification, isRead }, index) => (
          <NotificationItem
            key={notification.id}
            itemIndex={index}
            notification={notification}
            isRead={isRead}
            onMarkAsRead={onMarkAsRead}
            variant="page"
          />
        ))}
      </div>
    </section>
  );
}

export const NotificationsPageContent: React.FC<NotificationsPageContentProps> = ({
  notificationsWithRead,
}) => {
  const t = useTranslations('notifications.page');
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleMarkAsRead = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  if (notificationsWithRead.length === 0) {
    return (
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
            <div className="relative mb-10">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-accent/40">
                <Bell size={64} weight="BoldDuotone" className="text-primary/60" />
              </div>
              <div className="absolute -top-4 right-0 rounded-2xl bg-card px-6 py-3 text-xl font-semibold text-primary shadow-lg">
                {t('zzz')}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t('clearTitle')}
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              {t('clearBody')}
            </p>

            <Button
              asChild
              className="mt-10 h-14 rounded-full px-10 text-base font-semibold shadow-lg"
            >
              <Link href="/vocab-trainer">
                <VolumeLoud size={18} weight="BoldDuotone" className="mr-2" />
                {t('startLearning')}
              </Link>
            </Button>
          </div>
        </div>
        <NotificationsSidebar />
      </div>
    );
  }

  const notifications = notificationsWithRead.map(n => n.notification);
  const grouped = groupNotificationsByDate(notifications);

  const todayWithRead = grouped.today.map((n) => {
    const item = notificationsWithRead.find(i => i.notification.id === n.id);
    return { notification: n, isRead: item?.isRead ?? false };
  });
  const yesterdayWithRead = grouped.yesterday.map((n) => {
    const item = notificationsWithRead.find(i => i.notification.id === n.id);
    return { notification: n, isRead: item?.isRead ?? false };
  });
  const lastWeekWithRead = grouped.lastWeek.map((n) => {
    const item = notificationsWithRead.find(i => i.notification.id === n.id);
    return { notification: n, isRead: item?.isRead ?? false };
  });

  return (
    <div className="mt-8 flex flex-col gap-8 lg:flex-row">
      <div className="min-w-0 flex-1">
        <Section
          label={t('today')}
          items={todayWithRead}
          onMarkAsRead={handleMarkAsRead}
        />
        <Section
          label={t('yesterday')}
          items={yesterdayWithRead}
          onMarkAsRead={handleMarkAsRead}
        />
        <Section
          label={t('lastWeek')}
          items={lastWeekWithRead}
          onMarkAsRead={handleMarkAsRead}
        />
      </div>
      <NotificationsSidebar />
    </div>
  );
};
