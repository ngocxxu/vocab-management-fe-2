'use client';

import { RefreshCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';

type AppLoadingProps = {
  fullPage?: boolean;
};

export function AppLoading({ fullPage = false }: AppLoadingProps) {
  const t = useTranslations('shell');

  return (
    <div
      role="status"
      className={`flex items-center justify-center bg-background ${fullPage ? 'h-screen' : 'min-h-[60vh]'}`}
    >
      <RefreshCircle size={64} weight="BoldDuotone" className="animate-spin text-primary" />
      <span className="sr-only">{t('loading')}</span>
    </div>
  );
}
