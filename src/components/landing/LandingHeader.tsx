'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import LandingLocaleSwitch from '@/components/landing/LandingLocaleSwitch';

export default function LandingHeader({ logoSrc }: Readonly<{ logoSrc: string }>) {
  const t = useTranslations('landing.header');

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={logoSrc}
            alt="Vocab"
            width={40}
            height={40}
            priority
            className="h-9 w-9 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-foreground">Vocab</span>
            <span className="text-xs font-medium tracking-wider text-primary uppercase">
              Intelligence
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t('features')}
          </Link>
          <Link
            href="#methodology"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t('solutions')}
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t('pricing')}
          </Link>
          <span className="h-4 w-px bg-border" aria-hidden />
          <LandingLocaleSwitch />
          <Link
            href="/signin"
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            {t('signIn')}
          </Link>
          <Link href="/signup">
            <Button className="rounded-xl shadow-sm">{t('getStarted')}</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
