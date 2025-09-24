import type { TAuthResponse, TRefreshData, TResetPasswordData, TSigninData, TSignupData } from '@/types/auth';
import useSWR from 'swr';
import { authApi } from '@/utils/client-api';

// Hook for getting current user authentication status
export const useAuth = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'auth-verify',
    () => authApi.verify(),
  );

  return {
    user: (data),
    isAuthenticated: (data)?.isAuthenticated || false,
    isLoading,
    isError: error,
    mutate,
  };
};

// API functions for authentication mutations
export const authMutations = {
  // Sign in user
  signin: async (signinData: TSigninData): Promise<TAuthResponse> => {
    return await authApi.signin(signinData);
  },

  // Sign up user
  signup: async (signupData: TSignupData): Promise<TAuthResponse> => {
    return await authApi.signup(signupData);
  },

  // Sign out user
  signout: async (): Promise<{ message: string }> => {
    return await authApi.signout();
  },

  // Refresh authentication token
  refresh: async (refreshData: TRefreshData): Promise<{ message: string }> => {
    return await authApi.refresh(refreshData);
  },

  // Reset password
  resetPassword: async (resetData: TResetPasswordData): Promise<{ message: string }> => {
    return await authApi.resetPassword(resetData);
  },
};
