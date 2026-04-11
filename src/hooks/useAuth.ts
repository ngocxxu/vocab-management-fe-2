import type { TUser } from '@/types/auth';
import { useEffect, useState } from 'react';
import { verifyUser } from '@/actions';

type AuthData = TUser | { isAuthenticated: boolean } | null;

export const useAuth = () => {
  const [data, setData] = useState<AuthData>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Verify user on mount via server action
    // HttpOnly cookies can't be read from client-side JS,
    // so we call verifyUser() which reads cookies server-side
    const checkAuth = async () => {
      try {
        const result = await verifyUser();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
      } finally {
        setIsLoading(false);
      }
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
      setData(null);
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
