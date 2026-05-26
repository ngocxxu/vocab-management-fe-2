import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from '@/utils/auth-cookies';

const PROTECTED = ['/dashboard', '/library', '/vocab-list', '/vocab-trainer', '/profile', '/subjects', '/notifications'];
const AUTH_ROUTES = ['/signin', '/signup', '/forgot-password'];
const PUBLIC_ROUTES = ['/auth/callback'];
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

async function refreshSession(refreshToken: string): Promise<Session | null> {
  const res = await fetch(`${process.env.NESTJS_API_URL ?? 'http://localhost:3002/api/v1'}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    return null;
  }
  const data = await res.json() as Partial<Session>;
  return data.access_token && data.refresh_token ? (data as Session) : null;
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

export default async function proxy(request: NextRequest, _event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some(r => pathname.startsWith(r));
  const isAuth = AUTH_ROUTES.some(r => pathname.startsWith(r));

  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Clear cookies on expired session redirect
  if (isAuth && request.nextUrl.searchParams.get('expired') === '1') {
    return clearAuthCookies(NextResponse.next());
  }

  // Attempt token refresh
  if ((isProtected || isAuth) && refreshToken && isTokenExpiring(token)) {
    const session = await refreshSession(refreshToken);
    if (session) {
      if (isAuth) {
        const redirectUrl = getSafeRedirectPath(request.nextUrl.searchParams.get('redirect'), '/dashboard');
        return setAuthCookies(NextResponse.redirect(new URL(redirectUrl, request.url)), session);
      }
      return withRefreshedSession(request, session);
    }

    // Concurrent navigations/server actions can race refresh-token rotation in production.
    // If the access token still exists and is not expired, keep this request alive instead
    // of clearing cookies because another concurrent request may have already refreshed.
    if (token && !isTokenExpired(token)) {
      if (isAuth) {
        const redirectUrl = getSafeRedirectPath(request.nextUrl.searchParams.get('redirect'), '/dashboard');
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
      return NextResponse.next();
    }

    if (isProtected) {
      const url = new URL('/signin', request.url);
      url.searchParams.set('redirect', getSafeRedirectPath(`${pathname}${request.nextUrl.search}`, pathname));
      return clearAuthCookies(NextResponse.redirect(url));
    }

    return clearAuthCookies(NextResponse.next());
  }

  if (isProtected && !token) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('redirect', getSafeRedirectPath(`${pathname}${request.nextUrl.search}`, pathname));
    return NextResponse.redirect(url);
  }

  if (isAuth && token) {
    const redirectUrl = getSafeRedirectPath(request.nextUrl.searchParams.get('redirect'), '/dashboard');
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|_vercel|monitoring|.*\\..*).*)'],
};
