'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingCta() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl rounded-3xl bg-slate-900 px-8 py-12 text-center shadow-xl 2xl:rounded-[2rem] 2xl:px-12 2xl:py-16 dark:bg-slate-950">
          <h2 className="text-3xl font-bold text-white sm:text-4xl 2xl:text-5xl">
            Ready to Master Your Vocabulary?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/90 2xl:text-xl">
            Join 10,000+ polyglots, students, and professionals elevating
            their language game with data-driven precision.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 2xl:mt-12">
            <Link href="/signup">
              <Button
                size="lg"
                className="h-12 rounded-full bg-blue-600 px-8 text-base font-semibold text-white shadow-md hover:bg-blue-700 2xl:h-14 2xl:px-10 2xl:text-lg"
              >
                Get Started for Free
              </Button>
            </Link>
            <Link href="#pricing">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-2 border-white/40 bg-transparent text-base font-semibold text-white hover:bg-white/10 hover:text-white 2xl:h-14 2xl:px-10 2xl:text-lg"
              >
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-sm text-white/60 2xl:text-base">
            No credit card required. 14-day free trial of Pro features.
          </p>
        </div>
      </div>
    </section>
  );
}
