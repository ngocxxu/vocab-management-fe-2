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
    window.location.href = '/signin';
  }, 1000);
};
