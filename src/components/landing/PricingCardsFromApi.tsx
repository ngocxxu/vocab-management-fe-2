'use client';

import type { TPlan } from '@/types/plan';
import Link from 'next/link';
import { useState } from 'react';
import {
  Bolt,
  Book,
  CheckCircle,
  Download,
  Folder,
  RefreshCircle,
  Share,
  ShieldCheck,
  StarFall,
  Upload,
  VolumeLoud,
} from '@solar-icons/react/ssr';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const MEMBER_FEATURE_ICONS = [
  Bolt,
  Folder,
  Upload,
  StarFall,
  VolumeLoud,
  Download,
] as const;

type MemberIcon = (typeof MEMBER_FEATURE_ICONS)[number];

function getMemberFeatureIcon(feature: string, index: number): MemberIcon | undefined {
  const lower = feature.toLowerCase();
  if (lower.includes('export') || lower.includes('csv') || lower.includes('download')) {
    return Download;
  }
  if (lower.includes('audio') || lower.includes('voice') || lower.includes('native')) {
    return VolumeLoud;
  }
  if (lower.includes('folder') || lower.includes('custom folder')) {
    return Folder;
  }
  if (lower.includes('vocabulary') || (lower.includes('unlimited') && lower.includes('word'))) {
    return Bolt;
  }
  if (lower.includes('priority') || lower.includes('high-speed') || lower.includes('speed')) {
    return Upload;
  }
  if (lower.includes('ai') && (lower.includes('sentence') || lower.includes('contextual'))) {
    return StarFall;
  }
  return MEMBER_FEATURE_ICONS[index];
}

const GUEST_FEATURE_ICONS = [
  RefreshCircle,
  Folder,
  Book,
  Download,
  Share,
] as const;

function CheckItem({
  children,
  accent = false,
}: Readonly<{ children: React.ReactNode; accent?: boolean }>) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${accent ? 'bg-primary' : 'bg-border'}`}
      >
        <CheckCircle size={14} weight="BoldDuotone" className={accent ? 'text-primary-foreground' : 'text-muted-foreground'} />
      </span>
      <span className={`font-sans text-[15px] ${accent ? 'text-foreground' : 'text-muted-foreground'}`}>
        {children}
      </span>
    </li>
  );
}

function FeatureItemWithIcon({
  Icon,
  children,
  accent,
  muted = false,
}: Readonly<{
  Icon: React.ComponentType<{ size?: number; weight?: 'BoldDuotone'; className?: string }>;
  children: React.ReactNode;
  accent?: boolean;
  muted?: boolean;
}>) {
  const circleClass = muted
    ? 'bg-border text-muted-foreground'
    : accent
      ? 'bg-primary/15 text-primary'
      : 'bg-primary/10 text-primary';
  return (
    <li className="flex items-center gap-3">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${circleClass}`}>
        <Icon size={20} weight="BoldDuotone" />
      </span>
      <span className={`font-sans text-[15px] ${accent ? 'text-foreground' : 'text-muted-foreground'}`}>
        {children}
      </span>
    </li>
  );
}

function WaitlistModal({
  open,
  onOpenChange,
  onSuccess,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}>) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess?.();
    onOpenChange(false);
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold">
            Be the first to know
          </DialogTitle>
          <DialogDescription asChild>
            <p className="mt-2 text-center font-sans text-sm text-muted-foreground">
              Join our exclusive waitlist for early access to
              <br />
              Member features
            </p>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="rounded-xl border-border"
            required
          />
          <Button
            type="submit"
            className="w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Notify Me
          </Button>
        </form>
        <p className="mt-4 flex items-center justify-center gap-2 font-sans text-xs text-muted-foreground">
          <ShieldCheck size={14} weight="BoldDuotone" className="shrink-0" />
          No spam, only precision updates.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function PlanCard({
  plan,
  isRecommended,
  onGetNotified,
  isOnList,
}: Readonly<{
  plan: TPlan;
  isRecommended: boolean;
  onGetNotified?: () => void;
  isOnList?: boolean;
}>) {
  const isMember = plan.role === 'MEMBER';

  return (
    <div
      className={`flex h-full flex-col rounded-2xl bg-card p-8 shadow-sm 2xl:p-10 ${
        isRecommended
          ? 'border-2 border-primary shadow-lg md:origin-center'
          : 'border border-border'
      }`}
    >
      <p className="font-sans text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {plan.role}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h3 className="font-sans text-2xl font-bold text-card-foreground 2xl:text-3xl">
          {plan.name}
        </h3>
        {isMember && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-sans text-xs font-semibold text-primary">
            COMING SOON
          </span>
        )}
      </div>
      <p className="mt-2 font-sans text-[15px] leading-relaxed text-muted-foreground">
        {plan.priceLabel}
      </p>
      <p className="mt-6 font-sans text-xs font-medium tracking-wide text-muted-foreground uppercase">
        FEATURES
      </p>
      <ul className="mt-3 space-y-2">
        {plan.features.map((f, i) => {
          const memberIcon = isMember && getMemberFeatureIcon(f, i);
          if (memberIcon) {
            return (
              <FeatureItemWithIcon
                key={`${f}-${i}`}
                Icon={memberIcon}
                accent={isRecommended}
              >
                {f}
              </FeatureItemWithIcon>
            );
          }
          if (!isMember && GUEST_FEATURE_ICONS[i]) {
            return (
              <FeatureItemWithIcon key={`${f}-${i}`} Icon={GUEST_FEATURE_ICONS[i]} muted>
                {f}
              </FeatureItemWithIcon>
            );
          }
          return (
            <CheckItem key={`${f}-${i}`} accent={isRecommended}>
              {f}
            </CheckItem>
          );
        })}
      </ul>
      <div className="mt-auto pt-8">
        {isMember && isOnList
          ? (
              <div
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-100 py-3 font-sans font-semibold text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200"
                role="status"
                aria-live="polite"
              >
                <CheckCircle size={20} weight="BoldDuotone" className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                You're on the list!
              </div>
            )
          : isMember && onGetNotified
            ? (
                <Button
                  type="button"
                  onClick={onGetNotified}
                  className="w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow hover:bg-primary/90"
                  size="lg"
                >
                  Get Notified
                </Button>
              )
            : (
                <Link href="/signup" className="block">
                  <Button
                    variant={isRecommended ? 'default' : 'outline'}
                    className={
                      isRecommended
                        ? 'w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow hover:bg-primary/90'
                        : 'w-full rounded-xl border-border font-semibold text-foreground hover:bg-muted'
                    }
                    size={isRecommended ? 'lg' : undefined}
                  >
                    Start for Free
                  </Button>
                </Link>
              )}
      </div>
    </div>
  );
}

export default function PricingCardsFromApi({ plans }: Readonly<{ plans: TPlan[] }>) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);

  return (
    <>
      {plans.map(plan => (
        <div key={plan.role} className="h-full">
          <PlanCard
            plan={plan}
            isRecommended={plan.role === 'MEMBER'}
            onGetNotified={plan.role === 'MEMBER' ? () => setWaitlistOpen(true) : undefined}
            isOnList={plan.role === 'MEMBER' ? notifySuccess : undefined}
          />
        </div>
      ))}
      <WaitlistModal
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        onSuccess={() => setNotifySuccess(true)}
      />
    </>
  );
}
