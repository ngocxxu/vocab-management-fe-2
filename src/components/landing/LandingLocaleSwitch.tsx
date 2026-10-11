'use client';

import type { TLocale } from '@/i18n/config';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { setLocale } from '@/actions/locale';
import { LOCALE_LABELS, LOCALES } from '@/i18n/config';
import { cn } from '@/libs/utils';

/** Language choice on the landing page. Writes the same cookie as the profile setting, so sign-in and the app follow it. */
export default function LandingLocaleSwitch() {
  const t = useTranslations('landing.header');
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
    <div role="group" aria-label={t('languageLabel')} className="flex items-center gap-1 rounded-lg border border-border p-0.5">
      {LOCALES.map(locale => (
        <button
          key={locale}
          type="button"
          disabled={isPending}
          aria-pressed={locale === currentLocale}
          onClick={() => handleSelect(locale)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide uppercase transition-colors disabled:opacity-60',
            locale === currentLocale
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
