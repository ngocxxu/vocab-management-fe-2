import { cookies } from 'next/headers';

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 3600, // 1 hour (matches NestJS expires_in)
  ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
};

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('refreshToken')?.value;
}

// ⚠️ Only use in Server Actions, NOT in Route Handlers
export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set('accessToken', accessToken, AUTH_COOKIE_OPTIONS);
  cookieStore.set('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  const clearOpts = { ...AUTH_COOKIE_OPTIONS, maxAge: 0 };
  cookieStore.set('accessToken', '', clearOpts);
  cookieStore.set('refreshToken', '', clearOpts);
}
