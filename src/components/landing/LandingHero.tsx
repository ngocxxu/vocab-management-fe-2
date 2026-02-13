'use client';

import { Chart, QuestionCircle, SquareAcademicCap } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LandingHero() {
  return (
    <section className="container mx-auto px-4 pt-16 pb-12">
      <div className="mx-auto max-w-5xl text-center">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background px-3 py-1.5 text-xs font-medium tracking-wide text-primary uppercase sm:text-sm">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          PROFESSIONAL VOCABULARY MANAGEMENT
        </span>
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[5rem]">
          <span>Master Your Vocabulary</span>
          <span className="mt-2 block sm:mt-4">
            with
            {' '}
            <span className="text-primary italic sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[5rem]">Precision</span>
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground xl:text-xl 2xl:text-2xl">
          Track, learn, and practice words efficiently with our intelligent
          management system. Built for professionals who demand excellence.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 xl:gap-4">
          <Link href="/signup">
            <Button
              size="lg"
              className="h-12 rounded-full bg-blue-600 px-8 font-semibold text-white shadow-sm hover:bg-blue-700 xl:h-14 xl:px-10 xl:text-base 2xl:h-16 2xl:px-12 2xl:text-lg dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Create Account
            </Button>
          </Link>
          <Link href="/signin">
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-2 border-blue-600 bg-white px-8 font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700 xl:h-14 xl:px-10 xl:text-base 2xl:h-16 2xl:px-12 2xl:text-lg dark:bg-card dark:hover:bg-blue-950/30"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-5xl 2xl:max-w-7xl">
        <Card className="overflow-hidden rounded-2xl border shadow-lg">
          <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary">
                <div className="grid grid-cols-2 gap-0.5">
                  {[1, 2, 3, 4].map(i => (
                    <span key={i} className="h-1.5 w-1.5 rounded-sm bg-primary-foreground/80" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-6 w-40 rounded-md" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <div className="flex min-h-[400px] 2xl:min-h-[480px]">
            <aside className="w-52 shrink-0 bg-muted/40 p-4 2xl:w-60 2xl:p-5">
              <Skeleton className="mb-4 h-5 w-24 rounded-md" />
              <nav className="space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </nav>
              <div className="mt-6 rounded-lg border border-border/50 bg-muted/30 p-3">
                <Skeleton className="h-3 w-20 rounded" />
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
            </aside>
            <div className="flex-1 space-y-6 p-6 2xl:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                    <Chart size={20} weight="BoldDuotone" className="text-white" />
                  </div>
                  <Skeleton className="mb-2 h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <SquareAcademicCap size={20} weight="BoldDuotone" className="text-primary-foreground" />
                  </div>
                  <Skeleton className="mb-2 h-4 w-2/3 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500">
                    <QuestionCircle size={20} weight="BoldDuotone" className="text-white" />
                  </div>
                  <Skeleton className="mb-2 h-4 w-1/2 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
              </div>
              <div className="w-full rounded-xl border border-border bg-card p-4 2xl:min-h-[280px] 2xl:p-6">
                <Skeleton className="mb-4 h-4 w-40 rounded 2xl:w-52" />
                <div className="flex w-full items-end gap-2 2xl:min-h-[200px] 2xl:gap-4">
                  {[
                    { h: 'h-8', bg: 'bg-muted', h2xl: '2xl:h-12' },
                    { h: 'h-14', bg: 'bg-primary', h2xl: '2xl:h-24' },
                    { h: 'h-6', bg: 'bg-muted', h2xl: '2xl:h-10' },
                    { h: 'h-16', bg: 'bg-primary', h2xl: '2xl:h-32' },
                    { h: 'h-4', bg: 'bg-muted', h2xl: '2xl:h-8' },
                  ].map(({ h, bg, h2xl }) => (
                    <div
                      key={`${h}-${bg}`}
                      className={`min-w-0 flex-1 rounded-t ${h} ${h2xl} ${bg}`}
                    />
                  ))}
                </div>
              </div>
              <Skeleton className="h-12 w-full max-w-md rounded-lg" />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
