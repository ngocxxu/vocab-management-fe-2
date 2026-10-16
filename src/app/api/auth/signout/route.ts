import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { buildLogoutUrl, getAppOrigin, getAuth0Config } from '@/libs/auth0';
import { logger } from '@/libs/Logger';

// POST /api/auth/signout - clear the session cookies and hand back the Auth0 logout URL so the browser ends the SSO session too
export function POST(request: NextRequest) {
  let logoutUrl: string | undefined;
  try {
    logoutUrl = buildLogoutUrl(getAuth0Config(), `${getAppOrigin(request.nextUrl.origin)}/`);
  } catch (error) {
    // Not fatal: the local session still ends, only the Auth0 SSO session survives.
    logger.error('Auth0 logout URL unavailable:', { error });
  }

  const response = NextResponse.json({ message: 'Successfully signed out', logoutUrl });
  const clearOpts = {
    path: '/',
    maxAge: 0,
    sameSite: 'lax' as const,
    httpOnly: true,
    ...(process.env.NODE_ENV === 'production' && { secure: true }),
    ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
  };
  response.cookies.set('accessToken', '', clearOpts);
  response.cookies.set('refreshToken', '', clearOpts);

  return response;
}
