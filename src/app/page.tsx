'use client';

import type { TUser } from '@/types/auth';
import { Bolt, Book, Chart } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { verifyUser } from '@/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<TUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await verifyUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to verify user:', error);
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-8 w-8 rounded-full" />
          <Skeleton className="mx-auto h-4 w-20" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600">
              <span className="text-2xl font-bold text-white">V</span>
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
            Vocabulary Management
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg lg:text-xl dark:text-gray-400">
            Master new languages with our intelligent vocabulary management system.
            Track, learn, and practice words efficiently.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="mb-16 grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Book size={24} weight="BoldDuotone" className="text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Organize Vocabulary</CardTitle>
                <CardDescription>
                  Create and manage your vocabulary lists by subjects and languages
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Bolt size={24} weight="BoldDuotone" className="text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Smart Training</CardTitle>
                <CardDescription>
                  Practice with intelligent quizzes and spaced repetition
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <Chart size={24} weight="BoldDuotone" className="text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your learning progress with detailed analytics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center">
            <Card className="mx-auto max-w-md">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Join thousands of language learners improving their vocabulary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/signup" className="block">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Create Account
                  </Button>
                </Link>
                <Link href="/signin" className="block">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
