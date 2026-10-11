'use client';

import type { TLocale } from '@/i18n/config';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { setLocale } from '@/actions/locale';
import { Button } from '@/components/ui/button';
import { LOCALE_LABELS, LOCALES } from '@/i18n/config';
import { cn } from '@/libs/utils';

/** Picks the interface language. The choice is stored in a cookie, so it applies to this browser only. */
export const LocaleSwitcher: React.FC = () => {
  const t = useTranslations('profile');
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (locale: TLocale) => {
    if (locale === currentLocale) {
      return;
    }
    startTransition(async () => {
      await setLocale(locale);
    });
  };

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{t('languageLabel')}</p>
        <p className="text-xs text-muted-foreground">{t('languageHint')}</p>
      </div>
      <div role="group" aria-label={t('languageLabel')} className="flex shrink-0 gap-2">
        {LOCALES.map(locale => (
          <Button
            key={locale}
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            aria-pressed={locale === currentLocale}
            onClick={() => handleSelect(locale)}
            className={cn(locale === currentLocale && 'border-primary bg-primary/10 text-primary')}
          >
            {LOCALE_LABELS[locale]}
          </Button>
        ))}
      </div>
    </div>
  );
};
