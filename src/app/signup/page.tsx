'use client';

import type { SignUpFormData } from '@/libs/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/constants/auth';
import { authMutations } from '@/hooks/useAuth';
import { signUpSchema } from '@/libs/validations/auth';

export default function SignUpPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setErrorMessage('');

    try {
      // Transform form data to match API expectations
      const signupData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        avatar: '',
        role: UserRole.STAFF,
      };

      await authMutations.signup(signupData);
      router.push('/dashboard');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-8 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                <span className="text-xl font-bold text-white">V</span>
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Sign up to get started with your vocabulary management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="John"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Doe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a strong password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?
                  {' '}
                  <Link
                    href="/signin"
                    className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
