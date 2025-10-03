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
