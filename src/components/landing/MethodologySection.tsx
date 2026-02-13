'use client';

import { RefreshCircle, VolumeLoud } from '@solar-icons/react/ssr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MethodologySection() {
  return (
    <section id="methodology" className="py-20">
      <div className="container mx-auto max-w-7xl">
        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              The Science of Learning
            </h2>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <RefreshCircle
                  size={24}
                  weight="BoldDuotone"
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Spaced Repetition (SRS)
                </h3>
                <p className="mt-1 text-base text-muted-foreground">
                  Our algorithm predicts when you&apos;re about to forget a
                  word and prompts a review at the perfect psychological
                  moment for maximum retention.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <VolumeLoud
                  size={24}
                  weight="BoldDuotone"
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  AI Evaluation
                </h3>
                <p className="mt-1 text-base text-muted-foreground">
                  Beyond written tests, our AI analyzes your pronunciation
                  and cadence, providing instant feedback on how to sound
                  like a native speaker.
                </p>
              </div>
            </div>
          </div>
          <Card className="rounded-xl border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Retention Curve
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative h-60 min-h-[240px] w-full">
                <svg
                  viewBox="0 0 300 120"
                  className="h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {[30, 60, 90].map(y => (
                    <line
                      key={y}
                      x1={0}
                      y1={y}
                      x2={300}
                      y2={y}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                      className="text-muted-foreground/30"
                    />
                  ))}
                  <path
                    d="M 0 100 C 80 100 120 35 170 28 C 220 21 230 58 250 50 C 270 42 285 25 300 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-blue-600 dark:text-blue-500"
                  />
                </svg>
                <div
                  className="absolute top-[16%] left-[52%] flex -translate-x-1/2 items-center gap-2 rounded-full bg-blue-600 px-3.5 py-2 shadow-sm dark:bg-blue-600"
                  aria-hidden
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  <span className="text-sm font-semibold text-white">
                    95% Retention
                  </span>
                </div>
              </div>
              <p className="mt-4 text-base text-muted-foreground">
                Vocab maintains retention at
                {' '}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  95%
                </span>
                {' '}
                even after weeks of inactivity, thanks to science-backed
                spacing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
