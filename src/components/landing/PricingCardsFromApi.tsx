'use client';

import { useState } from 'react';
import type { TPlan } from '@/types/plan';
import { PlanCard } from '@/components/landing/pricing/PlanCard';
import { WaitlistModal } from '@/components/landing/pricing/WaitlistModal';

export default function PricingCardsFromApi({
  plans,
  currentUserRole,
}: Readonly<{ plans: TPlan[]; currentUserRole?: string }>) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);

  const publicPlans = plans.filter(p => p.role === 'GUEST' || p.role === 'MEMBER');
  return (
    <>
      {publicPlans.map(plan => (
        <div key={plan.role} className="h-full">
          <PlanCard
            plan={plan}
            isRecommended={plan.role === 'MEMBER'}
            isCurrentPlan={currentUserRole != null && plan.role === currentUserRole}
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
