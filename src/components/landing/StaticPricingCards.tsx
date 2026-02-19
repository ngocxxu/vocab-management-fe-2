'use client';

import Link from 'next/link';
import {
  Bolt,
  Book,
  Chart,
  Download,
  Folder,
  RefreshCircle,
  Share,
  StarFall,
  Upload,
  VolumeLoud,
} from '@solar-icons/react/ssr';
import { Button } from '@/components/ui/button';

const guestLimits = [
  { label: 'Up to 500 vocabulary words', Icon: Book },
  { label: 'Max 3 folders', Icon: Folder },
  { label: 'Standard rate limits (AI)', Icon: RefreshCircle },
];
const guestFeatures = [
  { label: 'Basic SRS Algorithm', Icon: Download },
  { label: 'Community shared decks', Icon: Share },
];

const memberUnlimited = [
  { label: 'Unlimited vocabulary words', Icon: Bolt },
  { label: 'Unlimited custom folders', Icon: Folder },
  { label: 'Priority high-speed AI access', Icon: Upload },
];
const memberPremium = [
  { label: 'AI Contextual Sentence Gen', Icon: StarFall },
  { label: 'Native-voice audio synthesis', Icon: VolumeLoud },
  { label: 'Advanced Mastery Analytics', Icon: Chart },
];

export default function StaticPricingCards() {
  return (
    <>
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
          {guestLimits.map(({ label, Icon }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-muted-foreground">
                <Icon size={20} weight="BoldDuotone" />
              </span>
              <span className="font-sans text-[15px] text-muted-foreground">
                {label.split(/(\d+)/).map((part, i) =>
                  /^\d+$/.test(part) ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-sans text-xs font-medium tracking-wide text-muted-foreground uppercase">
          FEATURES
        </p>
        <ul className="mt-3 space-y-2">
          {guestFeatures.map(({ label, Icon }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-muted-foreground">
                <Icon size={20} weight="BoldDuotone" />
              </span>
              <span className="font-sans text-[15px] text-muted-foreground">{label}</span>
            </li>
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
              <span className="ml-1 text-base font-normal 2xl:text-lg">/month</span>
            </p>
            <p className="mt-2 font-sans text-[15px] leading-relaxed text-muted-foreground">
              For power learners who demand precision and high performance.
            </p>
            <p className="mt-6 font-sans text-xs font-semibold tracking-wide text-primary uppercase">
              UNLIMITED POTENTIAL
            </p>
            <ul className="mt-3 space-y-2">
              {memberUnlimited.map(({ label, Icon }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Icon size={20} weight="BoldDuotone" />
                  </span>
                  <span className="font-sans text-[15px] text-card-foreground">{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-sans text-xs font-semibold tracking-wide text-primary uppercase">
              PREMIUM FEATURES
            </p>
            <ul className="mt-3 space-y-2">
              {memberPremium.map(({ label, Icon }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Icon size={20} weight="BoldDuotone" />
                  </span>
                  <span className="font-sans text-[15px] text-card-foreground">{label}</span>
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
    </>
  );
}
