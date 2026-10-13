'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ADMIN_TABS } from '../utils/admin-tabs';

/** The title and description of the admin page the URL points at. Renders nothing for a path with no tab. */
export function AdminPageHeader() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const page = ADMIN_TABS.find(tab => tab.path === pathname);

  if (!page) {
    return null;
  }

  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t(page.labelKey)}</h1>
      <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{t(page.descriptionKey)}</p>
    </header>
  );
}
