'use client';

import type { TUser } from '@/types/auth';
import type { TUserProfile } from '@/types/settings';
import {
  Letter,
  LockPassword,
  Pen,
  Phone,
  Shield,
  ShieldCheck,
  User,
} from '@solar-icons/react/ssr';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { verifyUser } from '@/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/libs/utils';

type ProfileSectionProps = {
  onProfileChangeAction: (profile: Partial<TUserProfile>) => void;
};

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  onProfileChangeAction,
}) => {
  const [user, setUser] = useState<TUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [formData, setFormData] = useState<TUserProfile>({
    id: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    avatar: '',
    role: '',
    isActive: false,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const userData = await verifyUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        setIsError(true);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const profile: TUserProfile = React.useMemo(() => user
    ? {
        id: user.id,
        email: user.email,
        phone: user.phone || '',
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isActive: true,
      }
    : {
        id: '',
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
        avatar: '',
        role: '',
        isActive: false,
      }, [user]);

  useEffect(() => {
    if (!isEditing) {
      setFormData(() => profile);
    }
  }, [profile, isEditing]);

  const handleInputChange = (field: keyof TUserProfile, value: string | boolean) => {
    if (isEditing) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      onProfileChangeAction({ [field]: value });
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData(profile);
  };

  const handleSaveClick = () => {
    onProfileChangeAction(formData);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setFormData(profile);
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-4 py-12">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-8">
          <div className="py-12 text-center">
            <p className="text-destructive">Failed to load profile data</p>
            <p className="mt-1 text-sm text-muted-foreground">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayProfile = isEditing ? formData : profile;
  const avatarUrl = displayProfile.avatar;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-border px-6 pt-6 pb-1">
            <h2 className="text-lg font-bold text-foreground">General Information</h2>
            <p className="mt-1 mb-3 text-sm text-muted-foreground">
              Update your photo and personal details here.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-0 md:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-3 border-r-0 border-b border-border p-6 md:min-w-[200px] ">
              <div className="relative">
                <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-border bg-muted">
                  {avatarUrl
                    ? (
                        <Image
                          src={avatarUrl}
                          alt="Profile"
                          width={112}
                          height={112}
                          className="h-full w-full object-cover"
                        />
                      )
                    : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User size={48} weight="BoldDuotone" className="text-muted-foreground" />
                        </div>
                      )}
                  <Button
                    type="button"
                    size="icon"
                    className="absolute -right-0.5 -bottom-0.5 h-8 w-8 rounded-full border-2 border-card bg-primary text-primary-foreground shadow hover:bg-primary/90"
                  >
                    <Pen size={14} weight="BoldDuotone" />
                  </Button>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Profile Picture</p>
                <p className="mt-0.5 text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div className="flex flex-col p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={displayProfile.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    placeholder="Bono"
                    disabled={!isEditing}
                    className="h-10 rounded-lg border border-input bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={displayProfile.lastName}
                    onChange={e => handleInputChange('lastName', e.target.value)}
                    placeholder="Bono"
                    disabled={!isEditing}
                    className="h-10 rounded-lg border border-input bg-background"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Letter size={18} weight="BoldDuotone" className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={displayProfile.email}
                      readOnly
                      className="h-10 rounded-lg border border-input bg-muted/50 pl-10 text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Role
                  </Label>
                  <div className="relative">
                    <Shield size={18} weight="BoldDuotone" className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="role"
                      value={displayProfile.role}
                      readOnly
                      className="h-10 rounded-lg border border-input bg-muted/50 pl-10 text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone size={18} weight="BoldDuotone" className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={displayProfile.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      placeholder="+1234567890"
                      disabled={!isEditing}
                      className="h-10 rounded-lg border border-input bg-background pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {isEditing
                  ? (
                      <>
                        <Button variant="ghost" onClick={handleCancelClick} className="text-muted-foreground hover:bg-transparent hover:text-muted-foreground">
                          Cancel
                        </Button>
                        <Button onClick={handleSaveClick}>
                          Save Changes
                        </Button>
                      </>
                    )
                  : (
                      <Button variant="outline" onClick={handleEditClick}>
                        Edit Profile
                      </Button>
                    )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground">Account Security</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Secure your account with 2FA and password management.
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <LockPassword size={20} weight="BoldDuotone" className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Change Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 2 months ago</p>
                  </div>
                </div>
                <Button variant="link" className="text-primary">
                  Update
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
                    <ShieldCheck size={20} weight="BoldDuotone" className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Enable 2FA for extra security.</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={twoFaEnabled}
                  onClick={() => setTwoFaEnabled(!twoFaEnabled)}
                  className={cn(
                    'relative h-6 w-11 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    twoFaEnabled ? 'bg-primary' : 'bg-muted',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 left-1 h-4 w-4 rounded-full bg-background shadow transition-transform',
                      twoFaEnabled && 'translate-x-5',
                    )}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground">Plan Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your subscription and billing.
            </p>
            <div className="mt-6 rounded-lg border bg-card p-5">
              <span className="inline-block rounded-md bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                PREMIUM PRO
              </span>
              <p className="mt-4 text-2xl font-bold text-foreground">$12.99/month</p>
              <p className="mt-2 text-sm text-muted-foreground">
                You have unlimited access to all features including offline mode and AI voice translation.
              </p>
              <Button variant="outline" className="mt-4 bg-background text-primary hover:bg-muted">
                Manage Subscription
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Next billing date
              {' '}
              <span className="font-semibold text-foreground">Dec 12, 2023</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-destructive/50 bg-destructive/5 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-destructive">Delete Account</h2>
              <p className="mt-1 text-sm text-destructive/90">
                Permanently remove your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" className="shrink-0">
              Delete Permanently
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
