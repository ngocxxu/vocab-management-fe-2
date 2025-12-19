import type { TAuthResponse, TRefreshData, TResetPasswordData, TSigninData, TSignupData } from '@/types/auth';
import { useEffect, useState } from 'react';
import { refresh, resetPassword, signout, verifyUser } from '@/actions';
import { hasAuthToken } from '@/utils/auth-utils';
import { authApi } from '@/utils/client-api';

export const useAuth = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Check cookie instead of calling API verify
    // If token exists, assume authenticated
    // If API calls fail with 401/403, axios interceptor will handle redirect
    const checkAuth = () => {
      const isAuthenticated = hasAuthToken();
      setData(isAuthenticated ? { isAuthenticated: true } : null);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const mutate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyUser();
      setData(result);
    } catch (err) {
      setError(err);
      const isAuthenticated = hasAuthToken();
      setData(isAuthenticated ? { isAuthenticated: true } : null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user: data,
    isAuthenticated: data?.isAuthenticated || false,
    isLoading,
    isError: error,
    mutate,
  };
};

export const authMutations = {
  signin: async (signinData: TSigninData): Promise<TAuthResponse> => {
    return await authApi.signin(signinData);
  },
  signup: async (signupData: TSignupData): Promise<TAuthResponse> => {
    return await authApi.signup(signupData);
  },
  signout: async (): Promise<{ message: string }> => {
    return await signout();
  },
  refresh: async (refreshData: TRefreshData): Promise<{ message: string }> => {
    return await refresh(refreshData);
  },
  resetPassword: async (resetData: TResetPasswordData): Promise<{ message: string }> => {
    return await resetPassword(resetData);
  },
};
