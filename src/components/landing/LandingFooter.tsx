'use client';

import { AltArrowRight } from '@solar-icons/react/ssr';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LandingFooter({ logoSrc }: Readonly<{ logoSrc: string }>) {
  const t = useTranslations('landing.footer');

  return (
    <footer id="pricing" className="border-t border-border bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src={logoSrc}
                alt="Vocab"
                width={140}
                height={36}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              {t('tagline')}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {t('product')}
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-foreground hover:text-primary"
                >
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link
                  href="#methodology"
                  className="text-sm text-foreground hover:text-primary"
                >
                  {t('methodology')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-foreground hover:text-primary"
                >
                  {t('api')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {t('support')}
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-foreground hover:text-primary"
                >
                  {t('helpCenter')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-foreground hover:text-primary"
                >
                  {t('community')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-foreground hover:text-primary"
                >
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {t('stayUpdated')}
            </h4>
            <div className="mt-3 flex gap-2">
              <Input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="rounded-lg bg-background"
              />
              <Button size="icon" className="shrink-0 rounded-lg">
                <AltArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('privacy')}
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
