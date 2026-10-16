import { LOGIN_PATH } from '@/constants/auth';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME } from '@/i18n/config';

/**
 * Reads the locale cookie directly: this runs outside React, so next-intl hooks are not available.
 */
function getSessionExpiredCopy() {
  const cookie = document.cookie.split('; ').find(item => item.startsWith(`${LOCALE_COOKIE_NAME}=`));
  const value = cookie?.slice(LOCALE_COOKIE_NAME.length + 1);
  const locale = isLocale(value) ? value : DEFAULT_LOCALE;

  return (locale === 'vi' ? vi : en).auth.sessionExpired;
}

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
    const copy = getSessionExpiredCopy();
    toast.error(copy.title, {
      description: copy.description,
      duration: 5000,
    });
  });

  // Redirect to Auth0 login after a short delay to allow toast to show
  setTimeout(() => {
    // Preserve current URL with query params for redirect after login
    const currentPath = `${window.location.pathname}${window.location.search}`;
    window.location.href = `${LOGIN_PATH}?redirect=${encodeURIComponent(currentPath)}`;
  }, 1000);
};

let isSigningOut = false;

export const getIsSigningOut = (): boolean => isSigningOut;

export const signoutClient = async (redirectTo = '/'): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }
  isSigningOut = true;
  try {
    const res = await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(typeof errorBody?.error === 'string' ? errorBody.error : 'Sign out failed');
    }
    const data = await res.json().catch(() => ({})) as { logoutUrl?: unknown };
    // Auth0 ends its own session, then sends the browser back to the app root.
    globalThis.location.href = typeof data.logoutUrl === 'string' ? data.logoutUrl : redirectTo;
  } finally {
    isSigningOut = false;
  }
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
