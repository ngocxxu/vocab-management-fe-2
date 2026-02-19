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
  canAccess?: boolean;
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
  canAccess,
}: PremiumFeatureGateProps) {
  const [upsellOpen, setUpsellOpen] = useState(false);
  const hasAccess = canAccess !== undefined ? canAccess : userRole !== UserRole.GUEST;
  const isGated = !hasAccess;

  const handleClick = () => {
    if (isGated) {
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
        title={isGated ? `Pro feature: ${featureName}` : undefined}
      >
        {isGated && <Lock size={16} weight="BoldDuotone" className="mr-2 shrink-0 opacity-80" />}
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
