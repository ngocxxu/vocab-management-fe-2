'use client';

import {
  Bolt,
  Cassette,
  Chart,
  Folder,
  Microphone,
  Settings,
  StarFall,
  User,
} from '@solar-icons/react/ssr';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingFeatures() {
  return (
    <section id="features" className="border-t border-border/80 bg-muted/50 py-20 dark:bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center 2xl:max-w-4xl">
          <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl 2xl:text-[4rem] 2xl:leading-tight">
            The Precision Toolkit
          </h2>
          <p className="mt-3 font-sans text-[15px] leading-relaxed text-muted-foreground 2xl:mt-4 2xl:text-2xl">
            Everything you need to move from &quot;learning&quot; to
            &quot;mastery&quot;.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-3 gap-8 2xl:max-w-7xl">
          <Card className="col-span-2 rounded-xl border border-border bg-card shadow-sm 2xl:p-6">
            <CardHeader className="flex flex-row flex-wrap gap-x-10 gap-y-4 md:flex-nowrap md:gap-x-12">
              <div className="min-w-0 flex-1 md:min-w-[45%]">
                <div className="relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <Folder
                    size={24}
                    weight="BoldDuotone"
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <Settings
                    size={14}
                    weight="BoldDuotone"
                    className="absolute top-0.5 right-0.5 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <CardTitle className="font-sans text-lg font-bold tracking-tight text-card-foreground 2xl:text-3xl">
                  Smart Library
                </CardTitle>
                <p className="mt-2 font-sans text-[13px] leading-relaxed text-muted-foreground 2xl:mt-3 2xl:text-lg">
                  Organize your journey with dedicated folders for specific
                  language pairs. Source to Target, managed with surgical
                  precision.
                </p>
              </div>
              <div className="mt-auto min-w-0 flex-1 space-y-2 rounded-lg bg-slate-100 p-3 md:min-w-[50%] dark:bg-muted/50">
                {[
                  { from: '🇺🇸', to: '🇻🇳', label: 'English to Vietnamese', active: true, opacity: 100 },
                  { from: '🇺🇸', to: '🇯🇵', label: 'English to Japanese', active: false, opacity: 80 },
                  { from: '🇺🇸', to: '🇰🇷', label: 'English to Korean', active: false, opacity: 60 },
                ].map(({ from, to, label, active, opacity }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm ${opacity === 60 ? 'opacity-60' : ''} ${opacity === 20 ? 'opacity-30' : ''}`}
                  >
                    <span className="text-lg leading-none 2xl:text-xl">{from}</span>
                    <span className="text-foreground">→</span>
                    <span className="text-lg leading-none 2xl:text-xl">{to}</span>
                    <span
                      className={`ml-auto font-sans text-sm 2xl:text-lg ${active ? 'font-semibold text-foreground' : 'font-normal text-foreground'}`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>

          <Card className="col-span-1 rounded-xl border border-border bg-card shadow-sm 2xl:p-6">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
                <Bolt
                  size={24}
                  weight="BoldDuotone"
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
              <CardTitle className="font-sans text-lg font-bold tracking-tight text-card-foreground 2xl:text-3xl">
                Adaptive Trainer
              </CardTitle>
              <p className="font-sans text-[13px] leading-relaxed text-muted-foreground 2xl:text-lg">
                Flip cards, MCQs, and AI-powered Speaking evaluation that
                listens to your accent.
              </p>
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-3 2xl:mt-4 dark:from-orange-600 dark:to-orange-700">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-600 dark:bg-orange-700">
                  <Microphone size={20} weight="BoldDuotone" className="text-white" />
                </div>
                <span className="text-sm font-medium tracking-wide text-white uppercase">
                  AI LISTENING...
                </span>
                <div className="ml-auto flex items-end gap-0.5">
                  {['h-3', 'h-5', 'h-7', 'h-5', 'h-3'].map((h, i) => (
                    <div key={i} className={`w-1 rounded bg-white/90 ${h}`} />
                  ))}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3 2xl:max-w-7xl">
          <Card className="rounded-xl border border-border bg-card shadow-sm 2xl:p-6">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success">
                <Chart
                  size={24}
                  weight="BoldDuotone"
                  className="text-white"
                />
              </div>
              <CardTitle className="font-sans text-lg font-bold tracking-tight text-card-foreground 2xl:text-3xl">
                Mastery Analytics
              </CardTitle>
              <p className="font-sans text-[13px] leading-relaxed text-muted-foreground 2xl:text-lg">
                Track your progress on a 0-10 scale across various subjects
                and disciplines.
              </p>
              <div className="mt-4 flex items-end gap-1">
                {['h-2', 'h-4', 'h-6', 'h-8', 'h-10'].map(h => (
                  <div
                    key={h}
                    className={`min-w-0 flex-1 rounded bg-success/90 ${h}`}
                  />
                ))}
              </div>
            </CardHeader>
          </Card>

          <Card className="col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm 2xl:p-6 2xl:px-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              <div className="space-y-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-md dark:bg-blue-700">
                  <StarFall size={24} weight="BoldDuotone" className="text-white" />
                </div>
                <h3 className="font-sans text-2xl font-bold tracking-tight text-foreground 2xl:text-3xl">
                  AI-Generated Context
                </h3>
                <p className="font-sans text-base leading-relaxed text-muted-foreground 2xl:text-lg">
                  Vocab doesn&apos;t just store words; it understands
                  them. Get sentences that match your
                  {' '}
                  <span className="text-blue-500 underline dark:text-blue-400">
                    current proficiency level
                  </span>
                  {' '}
                  automatically.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-900/40">
                  <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                  <span className="font-sans text-sm font-normal text-foreground">
                    Intermediate B2
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-muted">
                    <User size={18} weight="BoldDuotone" className="text-muted-foreground" />
                  </div>
                  <div className="rounded-lg bg-gray-100 px-4 py-3 dark:bg-muted">
                    <p className="font-sans text-base text-foreground">
                      What&apos;s an example for &apos;Persistence&apos;?
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-blue-600 dark:bg-blue-700">
                    <p className="px-4 py-3 font-sans text-base text-white">
                      &quot;Her
                      {' '}
                      <span className="text-blue-200 underline">persistence</span>
                      {' '}
                      in practicing the piano finally led to a flawless
                      performance.&quot;
                    </p>
                    <div className="border-t border-white/20 px-4 py-2">
                      <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-white uppercase">
                        <Bolt size={12} weight="BoldDuotone" />
                        AI TAILORED CONTEXT
                      </div>
                    </div>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600">
                    <Cassette size={18} weight="BoldDuotone" className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
