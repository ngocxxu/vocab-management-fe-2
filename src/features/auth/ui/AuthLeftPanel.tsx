'use client';

import { StarFall } from '@solar-icons/react/ssr';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const logoSrc = '/assets/logo/logo-light-mode.png';
const leftPanelBg = '#EFF4FC';

type AuthLeftPanelProps = {
  /** The sign-up panel leaves out the headline stats. */
  showStats?: boolean;
};

/** Brand panel beside the auth forms on large screens. */
export function AuthLeftPanel({ showStats = true }: AuthLeftPanelProps) {
  const t = useTranslations('auth.panel');

  return (
    <aside
      className="relative hidden min-w-0 flex-[0_0_45%] flex-col justify-between overflow-hidden px-8 py-10 lg:flex"
      style={{ backgroundColor: leftPanelBg }}
    >
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center gap-3 2xl:gap-4">
          <div className="relative size-10 shrink-0 min-[1600px]:size-16 2xl:size-14">
            <Image
              src={logoSrc}
              alt="Vocab"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-sans text-xl font-bold text-foreground uppercase min-[1600px]:text-4xl 2xl:text-3xl">Vocab</span>
            <p className="font-sans text-xs tracking-wide text-primary uppercase min-[1600px]:text-lg 2xl:text-base">INTELLIGENCE</p>
          </div>
        </div>
        <div className="mt-16 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 min-[1600px]:mt-32 min-[1600px]:px-6 min-[1600px]:py-3 min-[1600px]:text-xl 2xl:mt-24 2xl:px-5 2xl:py-2.5 2xl:text-lg">
          <StarFall size={18} weight="BoldDuotone" className="text-primary-foreground min-[1600px]:size-6 2xl:size-5" />
          <span className="font-sans text-sm font-medium text-primary-foreground uppercase min-[1600px]:text-xl 2xl:text-lg">
            {t('aiPowered')}
          </span>
        </div>
        <h1 className="mt-8 font-sans text-2xl leading-tight font-bold text-foreground min-[1600px]:text-6xl min-[1600px]:tracking-tight sm:text-3xl 2xl:mt-10 2xl:text-5xl 2xl:leading-tight">
          {t('headline')}
          {' '}
          <span className="text-primary">{t('headlineAccent')}</span>
        </h1>
        <p className="mt-4 font-sans text-base leading-relaxed text-muted-foreground min-[1600px]:text-2xl 2xl:mt-6 2xl:text-xl">
          {t('description')}
        </p>
        {showStats && (
          <div className="mt-8 flex flex-wrap items-center gap-8 min-[1600px]:gap-12 2xl:mt-12 2xl:gap-10">
            <div>
              <p className="font-sans text-xl font-bold text-foreground min-[1600px]:text-4xl 2xl:text-3xl">98%</p>
              <p className="font-sans text-sm text-muted-foreground uppercase min-[1600px]:text-xl 2xl:text-lg">{t('retentionRate')}</p>
            </div>
            <div>
              <p className="font-sans text-xl font-bold text-foreground min-[1600px]:text-4xl 2xl:text-3xl">15+</p>
              <p className="font-sans text-sm text-muted-foreground uppercase min-[1600px]:text-xl 2xl:text-lg">{t('globalLanguages')}</p>
            </div>
          </div>
        )}
      </div>
      <p className="relative mt-auto pt-8 font-sans text-xs text-muted-foreground uppercase min-[1600px]:text-lg 2xl:text-base">
        ©
        {' '}
        {t('copyright', { year: new Date().getFullYear() })}
      </p>
    </aside>
  );
}
