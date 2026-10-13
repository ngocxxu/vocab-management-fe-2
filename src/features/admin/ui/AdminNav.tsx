'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ADMIN_TABS } from '../utils/admin-tabs';

export function AdminNav() {
  const t = useTranslations('admin');
  const pathname = usePathname();

  return (
    <nav aria-label={t('nav.label')} className="flex gap-2 overflow-x-auto border-b border-border">
      {ADMIN_TABS.map(tab => (
        <Link
          key={tab.path}
          href={tab.path}
          aria-current={pathname === tab.path ? 'page' : undefined}
          className={`border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors ${
            pathname === tab.path
              ? 'border-primary font-medium text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {t(tab.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
