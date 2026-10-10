'use client';

import type { TUser } from '@/types/auth';
import type { TPlan } from '@/types/plan';
import type { TUserProfile } from '@/types/settings';
import { User } from '@solar-icons/react/ssr';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPlanBadgeClassName, getPlanDisplayName } from '@/constants/plan';
import { cn } from '@/libs/utils';
import { LocaleSwitcher } from './LocaleSwitcher';

type ProfileIdentityProps = {
  currentUser?: TUser | null;
  currentPlan?: TPlan | null;
};

const EMPTY_PROFILE: TUserProfile = {
  id: '',
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  avatar: '',
  role: '',
  isActive: false,
};

function toProfile(user: TUser): TUserProfile {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone || '',
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    role: user.role,
    isActive: true,
  };
}

function getPlanLabel(role: string, adminLabel: string, plan?: TPlan | null): string {
  if (role === 'ADMIN') {
    return adminLabel;
  }
  if (plan) {
    const priceSuffix = Number(plan.priceLabel) ? ` — ${plan.priceLabel}` : '';
    return `${plan.name}${priceSuffix}`;
  }
  return role ? getPlanDisplayName(role) : '';
}

/** Header of the profile page: avatar, name, email and plan. The details are shown read-only for now. */
export const ProfileIdentity: React.FC<ProfileIdentityProps> = ({ currentUser, currentPlan }) => {
  const t = useTranslations('settings.identity');
  const tShell = useTranslations('shell');
  const profile = currentUser ? toProfile(currentUser) : EMPTY_PROFILE;
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const planLabel = getPlanLabel(profile.role, tShell('roles.admin'), currentPlan);

  return (
    <section id="account" aria-labelledby="account-title" className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {profile.avatar
          ? (
              <Image
                src={profile.avatar}
                alt={t('photoAlt')}
                width={80}
                height={80}
                className="h-20 w-20 shrink-0 rounded-2xl border border-border object-cover"
              />
            )
          : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted">
                <User size={36} weight="BoldDuotone" className="text-muted-foreground" />
              </div>
            )}

        <div className="min-w-0 flex-1">
          <h2 id="account-title" className="truncate text-xl font-semibold text-foreground">
            {fullName || t('yourName')}
          </h2>
          <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
          {planLabel && (
            <span className={cn('mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', getPlanBadgeClassName(profile.role))}>
              {planLabel}
            </span>
          )}
        </div>

        <Button variant="outline" className="shrink-0" onClick={() => setIsDetailsOpen(true)}>
          {t('viewDetails')}
        </Button>
      </div>

      <LocaleSwitcher />

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('detailsTitle')}</DialogTitle>
            <DialogDescription>{t('detailsUnavailable')}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-foreground">{t('firstName')}</Label>
              <Input id="firstName" value={profile.firstName} readOnly className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-foreground">{t('lastName')}</Label>
              <Input id="lastName" value={profile.lastName} readOnly className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">{t('email')}</Label>
              <Input id="email" value={profile.email} readOnly className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">{t('phone')}</Label>
              <Input id="phone" type="tel" value={profile.phone} readOnly className="h-10 rounded-lg" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>{t('close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
