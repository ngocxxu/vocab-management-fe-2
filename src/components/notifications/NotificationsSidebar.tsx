'use client';

import { Settings, Star } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { markAllNotificationsAsRead } from '@/actions/notifications';
import { Button } from '@/components/ui/button';
import { cn } from '@/libs/utils';

const PREFERENCE_ITEMS: { id: string; label: string; description: string }[] = [
  { id: 'learningReminders', label: 'Learning Reminders', description: 'Daily practice nudges' },
  { id: 'achievements', label: 'Achievements', description: 'When you hit milestones' },
  { id: 'productUpdates', label: 'Product Updates', description: 'New features & tips' },
];

export const NotificationsSidebar: React.FC = () => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [learningReminders, setLearningReminders] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  const getPrefValue = (id: string): boolean => {
    if (id === 'learningReminders') {
      return learningReminders;
    }
    if (id === 'achievements') {
      return achievements;
    }
    return productUpdates;
  };

  const setPrefValue = (id: string, value: boolean) => {
    if (id === 'learningReminders') {
      setLearningReminders(value);
    } else if (id === 'achievements') {
      setAchievements(value);
    } else {
      setProductUpdates(value);
    }
  };

  const handleClearAll = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success('All notifications marked as read');
      startTransition(() => router.refresh());
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-80">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings size={18} weight="BoldDuotone" className="text-slate-500 dark:text-slate-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-300">
            Settings
          </h2>
        </div>
        <div className="space-y-3">
          {PREFERENCE_ITEMS.map(({ id, label, description }) => {
            const on = getPrefValue(id);
            return (
              <div
                key={id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => setPrefValue(id, !on)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    on ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600',
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform',
                      on ? 'translate-x-5' : 'translate-x-0.5',
                    )}
                    style={{ marginTop: 2 }}
                  />
                </button>
              </div>
            );
          })}
        </div>
        <Button
          variant="outline"
          className="w-full border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
          onClick={handleClearAll}
        >
          Clear All Notifications
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-5 dark:bg-slate-800">
        <div className="absolute top-0 right-0 opacity-20">
          <Star size={64} weight="BoldDuotone" className="text-blue-300" />
        </div>
        <div className="absolute bottom-0 left-0 opacity-20">
          <Star size={48} weight="BoldDuotone" className="text-blue-300" />
        </div>
        <div className="relative space-y-3">
          <h3 className="text-lg font-bold text-white">Level up your learning with Pro</h3>
          <p className="text-sm text-slate-300">Unlock advanced analytics and offline mode.</p>
          <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-700">
            <Link href="#">Upgrade Now</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
};
