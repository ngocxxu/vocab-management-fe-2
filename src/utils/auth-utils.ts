/**
 * Handles token expiration by showing a toast notification and redirecting to signin
 * This function is safe to use in both client and server environments
 */
export const handleTokenExpiration = () => {
  // Only execute on client side
  if (typeof window === 'undefined') {
    return;
  }

  // Show toast notification for outdated token
  import('sonner').then(({ toast }) => {
    toast.error('Session expired', {
      description: 'Your session has expired. Please sign in again.',
      duration: 5000,
    });
  });

  // Redirect to signin page after a short delay to allow toast to show
  setTimeout(() => {
    // Preserve current URL with query params for redirect after login
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const signInUrl = `/signin?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = signInUrl;
  }, 1000);
};

export const signoutClient = async (redirectTo = '/'): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }
  const res = await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(typeof data?.error === 'string' ? data.error : 'Sign out failed');
  }
  globalThis.location.href = redirectTo;
};

/**
 * Check if user has access token cookie (client-side only)
 * This is a lightweight check that doesn't make an API call
 * If token exists, assume authenticated. If API calls fail with 401/403,
 * axios interceptor will handle redirect to login.
 */
export const hasAuthToken = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return document.cookie.includes('accessToken=');
};
