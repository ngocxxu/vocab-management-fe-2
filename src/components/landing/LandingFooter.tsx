'use client';

import { AltArrowRight } from '@solar-icons/react/ssr';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LandingFooter({ logoSrc }: Readonly<{ logoSrc: string }>) {
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
              The premier destination for professional vocabulary management
              and high-performance language learning.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Product
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-foreground hover:text-primary"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#methodology"
                  className="text-sm text-foreground hover:text-primary"
                >
                  Methodology
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-foreground hover:text-primary"
                >
                  API
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Support
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-foreground hover:text-primary"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-foreground hover:text-primary"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-foreground hover:text-primary"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Stay Updated
            </h4>
            <div className="mt-3 flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
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
            ©
            {new Date().getFullYear()}
            {' '}
            Ngoc Quach. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
