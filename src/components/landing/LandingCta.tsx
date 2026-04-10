'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingCta() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl rounded-3xl bg-primary px-8 py-12 text-center shadow-xl 2xl:rounded-[2rem] 2xl:px-12 2xl:py-16">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl 2xl:text-5xl">
            Ready to Master Your Vocabulary?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-primary-foreground/90 2xl:text-xl">
            Join 10,000+ polyglots, students, and professionals elevating
            their language game with data-driven precision.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 2xl:mt-12">
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 rounded-full px-8 text-base font-semibold shadow-md 2xl:h-14 2xl:px-10 2xl:text-lg"
              >
                Get Started for Free
              </Button>
            </Link>
            <Link href="#pricing">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-2 border-primary-foreground/40 bg-transparent text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground 2xl:h-14 2xl:px-10 2xl:text-lg"
              >
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-sm text-primary-foreground/60 2xl:text-base">
            No credit card required. 14-day free trial of Pro features.
          </p>
        </div>
      </div>
    </section>
  );
}
