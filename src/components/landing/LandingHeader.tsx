'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingHeader({ logoSrc }: Readonly<{ logoSrc: string }>) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white backdrop-blur">
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
            Features
          </Link>
          <Link
            href="#methodology"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Solutions
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
          <span className="h-4 w-px bg-border" aria-hidden />
          <Link
            href="/signin"
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            Sign In
          </Link>
          <Link href="/signup">
            <Button className="rounded-xl shadow-sm">Get Started</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
