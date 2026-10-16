import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AUTH0_CALLBACK_PATH, AUTH0_TXN_COOKIE, AUTH0_TXN_MAX_AGE_SECONDS, buildAuthorizeUrl, createTransaction, getAppOrigin, getAuth0Config, safeRedirectPath } from '@/libs/auth0';
import { logger } from '@/libs/Logger';

// GET /api/auth/login - start Authorization Code + PKCE at Auth0 (?redirect=/path, ?mode=signup, ?connection=google)
export function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const appOrigin = getAppOrigin(origin);

  try {
    const config = getAuth0Config();
    const { transaction, challenge } = createTransaction(safeRedirectPath(searchParams.get('redirect'), '/dashboard'));
    const authorizeUrl = buildAuthorizeUrl(config, {
      redirectUri: `${appOrigin}${AUTH0_CALLBACK_PATH}`,
      state: transaction.state,
      challenge,
      signup: searchParams.get('mode') === 'signup',
      googleOnly: searchParams.get('connection') === 'google',
    });

    const response = NextResponse.redirect(authorizeUrl);
    // Lax so the cookie comes back on Auth0's top-level redirect to the callback; path-scoped to the auth routes.
    response.cookies.set(AUTH0_TXN_COOKIE, JSON.stringify(transaction), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: AUTH0_TXN_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    logger.error('Auth0 login start failed:', { error });
    return NextResponse.redirect(new URL('/signin?error=auth_not_configured', appOrigin));
  }
}
