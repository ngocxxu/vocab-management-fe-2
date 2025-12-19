'use client';

import type { TUser } from '@/types/auth';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import { signin, signout, signup, verifyUser } from '@/actions';
import { Skeleton } from '@/components/ui/skeleton';

type AuthContextType = {
  user: TUser | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
    role: string;
  }) => Promise<void>;
  signout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = use(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<TUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const userData = await verifyUser();
        setUser(userData || undefined);
        setIsError(false);
      } catch (error) {
        console.error('Failed to load user:', error);
        setIsError(true);
        setUser(undefined);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    loadUser();
  }, []);

  const isAuthenticated = !!user;

  const handleSignin = useCallback(async (email: string, password: string) => {
    try {
      await signin({ email, password });
      const userData = await verifyUser();
      setUser(userData || undefined);
    } catch (error) {
      console.error('Signin failed:', error);
      throw error;
    }
  }, []);

  const handleSignup = useCallback(async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
    role: string;
  }) => {
    try {
      await signup(userData);
      const userDataResult = await verifyUser();
      setUser(userDataResult || undefined);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  }, []);

  const handleSignout = useCallback(async () => {
    try {
      await signout();
      setUser(undefined);
    } catch (error) {
      console.error('Signout failed:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    isError,
    signin: handleSignin,
    signup: handleSignup,
    signout: handleSignout,
  }), [user, isAuthenticated, isLoading, isError, handleSignin, handleSignup, handleSignout]);

  if (!isInitialized) {
    return <Skeleton className="h-screen w-full" />;
  }

  return <AuthContext value={value}>{children}</AuthContext>;
};
