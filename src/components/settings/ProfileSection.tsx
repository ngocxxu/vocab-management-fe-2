'use client';

import type { TUserProfile } from '@/types/settings';
import { Camera, Check, Pencil, User, X } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

type ProfileSectionProps = {
  onProfileChangeAction: (profile: Partial<TUserProfile>) => void;
};

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  onProfileChangeAction,
}) => {
  const { user, isLoading, isError } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState<TUserProfile>({
    id: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    avatar: '',
    role: '',
    isActive: false,
  });

  // Convert TUser to TUserProfile format
  const profile: TUserProfile = React.useMemo(() => user
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
      }, [user]);

  // Update form data when profile changes
  React.useEffect(() => {
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

  const handleEditClick = () => {
    setIsEditing(true);
    setFormData(profile);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData(profile);
  };

  const handleApplyClick = () => {
    onProfileChangeAction(formData);
    setIsEditing(false);
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
          <div className="flex items-center justify-center space-x-2 py-8">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Set your account details</CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={isEditing ? formData.email : profile.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="border-blue-500"
                disabled
              />
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={isEditing ? formData.firstName : profile.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={isEditing ? formData.phone : profile.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={isEditing ? formData.role : profile.role}
                onChange={e => handleInputChange('role', e.target.value)}
                placeholder="Enter your role"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={isEditing ? formData.lastName : profile.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                disabled={!isEditing}
              />
            </div>

          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {(isEditing ? formData.avatar : profile.avatar)
                ? (
                    <Image
                      src={(isEditing ? formData.avatar : profile.avatar) || ''}
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

        {/* Apply/Cancel buttons - only show when editing */}
        {isEditing && (
          <div className="mt-6 flex justify-end gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={handleCancelClick}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleApplyClick}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Apply Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
