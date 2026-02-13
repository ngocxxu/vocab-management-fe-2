'use client';

import Link from 'next/link';
import {
  Chart,
  CheckCircle,
  StarFall,
  VolumeLoud,
} from '@solar-icons/react/ssr';
import { Button } from '@/components/ui/button';

const tagline = '• FLEXIBLE PLANS FOR EVERY LEARNER';
const headingPlain = 'Unlock Your ';
const headingGradient = 'Full Potential';
const subtitle
  = 'Choose the role that fits your journey. From casual explorers to dedicated polyglots, we have the tools you need to master any language.';

const guestLimits = [
  'Up to 500 vocabulary words',
  'Max 3 folders',
  'Standard rate limits (AI)',
];
const guestFeatures = ['Basic SRS Algorithm', 'Community shared decks'];

const memberUnlimited = [
  'Unlimited vocabulary words',
  'Unlimited custom folders',
  'Priority high-speed AI access',
];
const memberPremium = [
  { label: 'AI Contextual Sentence Gen', Icon: StarFall },
  { label: 'Native-voice audio synthesis', Icon: VolumeLoud },
  { label: 'Advanced Mastery Analytics', Icon: Chart },
];

function CheckItem({
  children,
  accent = false,
}: Readonly<{
  children: React.ReactNode;
  accent?: boolean;
}>) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${accent ? 'bg-primary' : 'bg-border'}`}
      >
        <CheckCircle size={14} weight="BoldDuotone" className={accent ? 'text-primary-foreground' : 'text-muted-foreground'} />
      </span>
      <span
        className={`font-sans text-[15px] ${accent ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        {children}
      </span>
    </li>
  );
}

export default function LandingPricing() {
  return (
    <section
      id="pricing"
      className="border-t border-border/80 bg-muted/50 py-20 dark:bg-background"
    >
      <div className="container mx-auto max-w-[1600px] px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mx-auto w-fit rounded-full border border-primary px-3 py-1 font-sans text-xs font-semibold tracking-wide text-primary uppercase">
            {tagline}
          </p>
          <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight sm:text-4xl 2xl:text-[2.75rem]">
            <span className="text-foreground">
              {headingPlain}
            </span>
            <span className="text-primary">
              {headingGradient}
            </span>
          </h2>
          <p className="mx-auto mt-4 font-sans text-[15px] leading-relaxed text-muted-foreground 2xl:text-base">
            {subtitle}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 overflow-visible md:grid-cols-2 md:items-center md:gap-10 2xl:max-w-6xl">
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm 2xl:p-10">
            <p className="font-sans text-xs font-medium tracking-wide text-muted-foreground uppercase">
              GUEST
            </p>
            <h3 className="mt-2 font-sans text-2xl font-bold text-card-foreground 2xl:text-3xl">
              Free
            </h3>
            <p className="mt-2 font-sans text-[15px] leading-relaxed text-muted-foreground">
              Essential tools for those just starting their vocabulary journey.
            </p>
            <p className="mt-6 font-sans text-xs font-medium tracking-wide text-muted-foreground uppercase">
              LIMITS
            </p>
            <ul className="mt-3 space-y-2">
              {guestLimits.map(item => (
                <CheckItem key={item}>
                  {item.split(/(\d+)/).map((part, i) =>
                    /^\d+$/.test(part)
                      ? (
                          <strong key={i}>{part}</strong>
                        )
                      : (
                          <span key={i}>{part}</span>
                        ),
                  )}
                </CheckItem>
              ))}
            </ul>
            <p className="mt-6 font-sans text-xs font-medium tracking-wide text-muted-foreground uppercase">
              FEATURES
            </p>
            <ul className="mt-3 space-y-2">
              {guestFeatures.map(item => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <Link href="/signup" className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-border font-semibold text-foreground hover:bg-muted"
                >
                  Start for Free
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-lg md:origin-center 2xl:p-10">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1.5 font-sans text-xs font-semibold tracking-wide text-primary-foreground uppercase">
              RECOMMENDED
            </span>
            <div className="flex flex-1 flex-col">
              <div className="flex flex-1 flex-col pt-4">
                <p className="font-sans text-xs font-medium tracking-wide text-primary uppercase">
                  MEMBER
                </p>
                <p className="mt-2 font-sans text-2xl font-bold text-card-foreground 2xl:text-3xl">
                  <span>$12</span>
                  <span className="ml-1 text-base font-normal 2xl:text-lg">
                    /month
                  </span>
                </p>
                <p className="mt-2 font-sans text-[15px] leading-relaxed text-muted-foreground">
                  For power learners who demand precision and high performance.
                </p>
                <p className="mt-6 font-sans text-xs font-semibold tracking-wide text-primary uppercase">
                  UNLIMITED POTENTIAL
                </p>
                <ul className="mt-3 space-y-2">
                  {memberUnlimited.map(item => (
                    <CheckItem key={item} accent>
                      {item}
                    </CheckItem>
                  ))}
                </ul>
                <p className="mt-6 font-sans text-xs font-semibold tracking-wide text-primary uppercase">
                  PREMIUM FEATURES
                </p>
                <ul className="mt-3 space-y-2">
                  {memberPremium.map(({ label, Icon }) => (
                    <li key={label} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-primary">
                        <Icon size={20} weight="BoldDuotone" />
                      </span>
                      <span className="font-sans text-[15px] text-card-foreground">
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link href="/signup" className="block">
                    <Button
                      className="w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow hover:bg-primary/90"
                      size="lg"
                    >
                      Start Membership
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
