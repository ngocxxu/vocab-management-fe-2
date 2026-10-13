'use client';

import type { TAiSettings, TCacheRow } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { AiSettingsPanel } from './AiSettingsPanel';
import { CacheStatsPanel } from './CacheStatsPanel';

type TAdminSystemPanelProps = Readonly<{
  aiSettings: TAiSettings;
  cacheRows: TCacheRow[];
}>;

/** The system page: the AI settings on top, the app caches below. */
export function AdminSystemPanel({ aiSettings, cacheRows }: TAdminSystemPanelProps) {
  const t = useTranslations('admin.system');

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="admin-system-ai" className="flex flex-col gap-4">
        <h2 id="admin-system-ai" className="text-lg font-semibold">{t('sections.ai')}</h2>
        <AiSettingsPanel settings={aiSettings} />
      </section>

      <section aria-labelledby="admin-system-cache" className="flex flex-col gap-4">
        <h2 id="admin-system-cache" className="text-lg font-semibold">{t('sections.cache')}</h2>
        <CacheStatsPanel rows={cacheRows} />
      </section>
    </div>
  );
}
