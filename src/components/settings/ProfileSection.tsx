'use client';

import type { TUserProfile } from '@/types/settings';
import { Camera, Loader2, User } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

type ProfileSectionProps = {
  onProfileChangeAction: (profile: Partial<TUserProfile>) => void;
};

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  onProfileChangeAction,
}) => {
  const { user, isLoading, isError } = useAuth();

  // Convert TUser to TUserProfile format
  const profile: TUserProfile = user
    ? {
        id: user.id,
        email: user.email,
        phone: user.phone || '',
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isActive: true, // Default value since it's not in TUser
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
      };
  const handleInputChange = (field: keyof TUserProfile, value: string | boolean) => {
    onProfileChangeAction({ [field]: value });
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Set your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            <span className="ml-2 text-slate-600 dark:text-slate-400">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Set your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400">Failed to load profile data</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Please try refreshing the page
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Set your account details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={profile.role}
                onChange={e => handleInputChange('role', e.target.value)}
                placeholder="Enter your role"
                disabled
              />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {profile.avatar
                ? (
                    <Image
                      src={profile.avatar}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  )
                : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                      <User className="h-8 w-8 text-slate-500" />
                    </div>
                  )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Edit photo
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
