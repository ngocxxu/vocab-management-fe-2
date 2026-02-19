'use client';

import { Lock } from '@solar-icons/react/ssr';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UpsellModal } from './UpsellModal';
import { UserRole } from '@/constants/auth';

type PremiumFeatureGateProps = Readonly<{
  userRole: string | undefined;
  featureName: string;
  description?: string;
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}>;

export function PremiumFeatureGate({
  userRole,
  featureName,
  description,
  onClick,
  children,
  variant = 'outline',
  className,
  size,
}: PremiumFeatureGateProps) {
  const [upsellOpen, setUpsellOpen] = useState(false);
  const isGuest = userRole === UserRole.GUEST;

  const handleClick = () => {
    if (isGuest) {
      setUpsellOpen(true);
    } else {
      onClick();
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        title={isGuest ? `Pro feature: ${featureName}` : undefined}
      >
        {isGuest && <Lock size={16} weight="BoldDuotone" className="mr-2 shrink-0 opacity-80" />}
        {children}
      </Button>
      <UpsellModal
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        featureName={featureName}
        description={description}
      />
    </>
  );
}
