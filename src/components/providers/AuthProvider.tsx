'use client';

import type { TUser } from '@/types/auth';
import { createContext, use, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, isAuthenticated, isLoading, isError, mutate } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  const signin = async (email: string, password: string) => {
    try {
      const { authMutations } = await import('@/hooks/useAuth');
      await authMutations.signin({ email, password });
      await mutate(); // Refresh auth state
    } catch (error) {
      console.error('Signin failed:', error);
      throw error;
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
    role: string;
  }) => {
    try {
      const { authMutations } = await import('@/hooks/useAuth');
      await authMutations.signup(userData);
      await mutate(); // Refresh auth state
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const signout = async () => {
    try {
      const { authMutations } = await import('@/hooks/useAuth');
      await authMutations.signout();
      await mutate(); // Refresh auth state
    } catch (error) {
      console.error('Signout failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    isError,
    signin,
    signup,
    signout,
  }), [user, isAuthenticated, isLoading, isError, signin, signup, signout]);

  if (!isInitialized) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  return <AuthContext value={value}>{children}</AuthContext>;
};
