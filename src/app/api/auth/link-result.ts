import { NextResponse } from 'next/server';
import { AUTH0_TXN_COOKIE } from '@/libs/auth0';

/**
 * Sends the browser to a page of this app with result params. 303 on purpose: a 307 would repeat a POST on the target page.
 * Pass `clearTransaction` when this ends an Auth0 transaction, so its cookie does not outlive it.
 */
export function appRedirect(
  appOrigin: string,
  path: string,
  params: Record<string, string>,
  options: { hash?: string; clearTransaction?: boolean } = {},
): NextResponse {
  const url = new URL(path, appOrigin);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }
  if (options.hash) {
    url.hash = options.hash;
  }
  const response = NextResponse.redirect(url, 303);
  if (options.clearTransaction) {
    response.cookies.set(AUTH0_TXN_COOKIE, '', { path: '/api/auth', maxAge: 0 });
  }
  return response;
}
