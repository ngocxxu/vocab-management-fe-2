'use client';

import type { TPlan } from '@/types/plan';
import type { TUser } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { verifyUser } from '@/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';
import LandingCta from '@/components/landing/LandingCta';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingFooter from '@/components/landing/LandingFooter';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import LandingPricing from '@/components/landing/LandingPricing';
import MethodologySection from '@/components/landing/MethodologySection';

export default function HomePageClient({ initialPlans }: Readonly<{ initialPlans: TPlan[] }>) {
  const router = useRouter();
  const { theme, mounted } = useTheme();
  const [user, setUser] = useState<TUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await verifyUser();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const isAuthenticated = !!user;
  const logoSrc
    = !mounted || theme !== 'dark'
      ? '/assets/logo/logo-light-mode.png'
      : '/assets/logo/logo-dark-mode.png';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-8 w-8 rounded-full" />
          <Skeleton className="mx-auto h-4 w-20" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader logoSrc={logoSrc} />
      <main>
        <LandingHero />
        <LandingFeatures />
        <MethodologySection />
        <LandingPricing plans={initialPlans} />
        <LandingCta />
        <LandingFooter logoSrc={logoSrc} />
      </main>
    </div>
  );
}
