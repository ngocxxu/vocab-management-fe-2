import type { TAuthResponse, TRefreshData, TResetPasswordData, TSigninData, TSignupData, TVerifyResponse } from '@/types/auth';
import useSWR from 'swr';
import axiosInstance from '@/libs/axios';
import { authApi } from '@/utils/client-api';

// SWR fetcher function using axios
const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

// Hook for getting current user authentication status
export const useAuth = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/auth/verify',
    fetcher,
  );

  return {
    user: (data as TVerifyResponse)?.user,
    isAuthenticated: (data as TVerifyResponse)?.isAuthenticated || false,
    isLoading,
    isError: error,
    mutate,
  };
};

// API functions for authentication mutations
export const authMutations = {
  // Sign in user
  signin: async (signinData: TSigninData): Promise<TAuthResponse> => {
    const response = await authApi.signin(signinData);
    return response;
  },

  // Sign up user
  signup: async (signupData: TSignupData): Promise<TAuthResponse> => {
    const response = await authApi.signup(signupData);
    return response;
  },

  // Sign out user
  signout: async (): Promise<{ message: string }> => {
    const response = await authApi.signout();
    return response;
  },

  // Refresh authentication token
  refresh: async (refreshData: TRefreshData): Promise<{ message: string }> => {
    const response = await authApi.refresh(refreshData);
    return response;
  },

  // Reset password
  resetPassword: async (resetData: TResetPasswordData): Promise<{ message: string }> => {
    const response = await authApi.resetPassword(resetData);
    return response;
  },
};
