import type { TAuthResponse, TRefreshData, TResetPasswordData, TSigninData, TSignupData, TUser } from '@/types/auth';
import { useEffect, useState } from 'react';
import { refresh, resetPassword, signout, verifyUser } from '@/actions';
import { hasAuthToken } from '@/utils/auth-utils';
import { authApi } from '@/utils/client-api';

type AuthData = TUser | { isAuthenticated: boolean } | null;

export const useAuth = () => {
  const [data, setData] = useState<AuthData>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
      setError(err instanceof Error ? err : new Error(String(err)));
      const isAuthenticated = hasAuthToken();
      setData(isAuthenticated ? { isAuthenticated: true } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = data !== null && ('isAuthenticated' in data ? data.isAuthenticated : true);

  return {
    user: data && 'id' in data ? data : null,
    isAuthenticated,
    isLoading,
    isError: error !== null,
    error,
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
