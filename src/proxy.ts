import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRefreshLock, getRefreshLockKey, performRefresh } from '@/libs/refresh-lock';
import { LOGIN_PATH } from '@/constants/auth';
import { AUTH_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from '@/utils/auth-cookies';

const PROTECTED = ['/dashboard', '/library', '/vocab-list', '/vocab-trainer', '/profile', '/subjects', '/notifications', '/admin'];
const REFRESH_THRESHOLD = 60;

type Session = { access_token: string; refresh_token: string };

function getSafeRedirectPath(value: string | null, fallback: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  try {
    const url = new URL(value, 'http://local.app');
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

function getJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: unknown };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpiring(token?: string): boolean {
  if (!token) {
    return true;
  }
  const exp = getJwtExp(token);
  return exp ? exp - Math.floor(Date.now() / 1000) <= REFRESH_THRESHOLD : false;
}

function isTokenExpired(token?: string): boolean {
  if (!token) {
    return true;
  }
  const exp = getJwtExp(token);
  return exp ? exp <= Math.floor(Date.now() / 1000) : true;
}

function shouldRefresh(accessToken: string | undefined, request: NextRequest): boolean {
  if (!isTokenExpiring(accessToken)) {
    return false;
  }

  const cookieAccessToken = request.cookies.get('accessToken')?.value;
  if (cookieAccessToken && !isTokenExpiring(cookieAccessToken)) {
    return false;
  }

  return true;
}

function setAuthCookies(response: NextResponse, session: Session): NextResponse {
  response.cookies.set('accessToken', session.access_token, AUTH_COOKIE_OPTIONS);
  response.cookies.set('refreshToken', session.refresh_token, REFRESH_COOKIE_OPTIONS);
  return response;
}

function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set('accessToken', '', { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set('refreshToken', '', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
  return response;
}

function withRefreshedSession(request: NextRequest, session: Session): NextResponse {
  const headers = new Headers(request.headers);
  const cookies = new Map(
    headers.get('cookie')?.split(';').map((c) => {
      const [k = '', ...v] = c.trim().split('=');
      return [k, v.join('=')] as const;
    }) ?? [],
  );
  cookies.set('accessToken', session.access_token);
  cookies.set('refreshToken', session.refresh_token);
  headers.set('cookie', [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; '));

  return setAuthCookies(NextResponse.next({ request: { headers } }), session);
}

function loginRedirect(request: NextRequest, path: string): NextResponse {
  const url = new URL(LOGIN_PATH, request.url);
  url.searchParams.set('redirect', getSafeRedirectPath(path, path));
  return NextResponse.redirect(url);
}

export default async function proxy(request: NextRequest, _event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (!PROTECTED.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const returnTo = `${pathname}${request.nextUrl.search}`;

  if (refreshToken && shouldRefresh(token, request)) {
    const lockKey = getRefreshLockKey(token, refreshToken);
    const session = await getRefreshLock(lockKey).getOrRefresh(
      () => performRefresh(refreshToken),
    );

    if (session) {
      return withRefreshedSession(request, session);
    }

    // Concurrent navigations/server actions can race refresh-token rotation in production.
    // If the access token still exists and is not expired, keep this request alive instead
    // of clearing cookies because another concurrent request may have already refreshed.
    if (token && !isTokenExpired(token)) {
      return NextResponse.next();
    }

    return clearAuthCookies(loginRedirect(request, returnTo));
  }

  if (!token) {
    return loginRedirect(request, returnTo);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|_vercel|monitoring|.*\\..*).*)'],
};
