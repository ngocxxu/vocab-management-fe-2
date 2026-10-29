'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Public files under public/assets/logo. The download name is what the user sees in their file picker.
// Each preview sits on the background its logo was drawn for: light logo on light, dark logo on dark.
const LOGO_VARIANTS = [
  { key: 'light', src: '/assets/logo/logo-light-mode.png', filename: 'vocab-logo-light.png', width: 556, height: 554, panelClass: 'bg-logo-stage-light' },
  { key: 'dark', src: '/assets/logo/logo-dark-mode.png', filename: 'vocab-logo-dark.png', width: 643, height: 645, panelClass: 'bg-logo-stage-dark' },
] as const;

export function LogoDownload() {
  const t = useTranslations('connectAi');

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{t('logo.title')}</p>
        <p className="text-sm text-muted-foreground">{t('logo.hint')}</p>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {LOGO_VARIANTS.map(variant => (
          <li key={variant.key} className="flex flex-col gap-3">
            <div className={`flex h-36 items-center justify-center rounded-lg border border-border p-4 ${variant.panelClass}`}>
              <Image
                src={variant.src}
                alt={t(`logo.${variant.key}.alt`)}
                width={variant.width}
                height={variant.height}
                className="h-full w-auto object-contain"
              />
            </div>
            <p className="text-sm font-medium text-foreground">{t(`logo.${variant.key}.label`)}</p>
            <a
              href={variant.src}
              download={variant.filename}
              className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {t(`logo.${variant.key}.download`)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
