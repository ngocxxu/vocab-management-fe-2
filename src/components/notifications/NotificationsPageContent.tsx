'use client';

import type { TNotification } from '@/types/notification';
import { Bell, VolumeLoud } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from './NotificationItem';
import { NotificationsSidebar } from './NotificationsSidebar';
import { groupNotificationsByDate } from './utils';

type NotificationWithRead = {
  notification: TNotification;
  isRead: boolean;
};

type NotificationsPageContentProps = Readonly<{
  notificationsWithRead: NotificationWithRead[];
}>;

const SECTION_LABELS = {
  today: 'TODAY',
  yesterday: 'YESTERDAY',
  lastWeek: 'LAST WEEK',
} as const;

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
      <h2 className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
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
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30">
                <Bell size={64} weight="BoldDuotone" className="text-blue-300 dark:text-blue-400" />
              </div>
              <div className="absolute -top-4 right-0 rounded-2xl bg-white px-6 py-3 text-xl font-semibold text-blue-700 shadow-lg dark:bg-slate-800 dark:text-blue-200">
                Zzz...
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
              All clear! You're completely up to date.
            </h2>
            <p className="mt-4 max-w-xl text-slate-500 dark:text-slate-400">
              We'll let you know when you hit new milestones or need a reminder to keep your streak alive.
            </p>

            <Button
              asChild
              className="mt-10 h-14 rounded-full bg-blue-600 px-10 text-base font-semibold text-white shadow-lg hover:bg-blue-700"
            >
              <Link href="/vocab-trainer">
                <VolumeLoud size={18} weight="BoldDuotone" className="mr-2" />
                Start Learning
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
          label={SECTION_LABELS.today}
          items={todayWithRead}
          onMarkAsRead={handleMarkAsRead}
        />
        <Section
          label={SECTION_LABELS.yesterday}
          items={yesterdayWithRead}
          onMarkAsRead={handleMarkAsRead}
        />
        <Section
          label={SECTION_LABELS.lastWeek}
          items={lastWeekWithRead}
          onMarkAsRead={handleMarkAsRead}
        />
      </div>
      <NotificationsSidebar />
    </div>
  );
};
