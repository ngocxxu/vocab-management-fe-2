import type { TAuth0Transaction } from '@/libs/auth0';
import { NextResponse } from 'next/server';
import { AUTH0_CALLBACK_PATH, AUTH0_TXN_COOKIE, exchangeCode, getAuth0Config } from '@/libs/auth0';
import { logger } from '@/libs/Logger';
import { API_ENDPOINTS } from '@/utils/api-config';
import { getBackendAuthUrl, parseBackendResponse } from '../session-response';

// Codes the Profile page can explain; anything else from the BE is shown as a generic failure.
const KNOWN_LINK_ERRORS = new Set([
  'identity_already_linked',
  'email_not_verified',
  'link_proof_stale',
  'link_nonce_invalid',
  'id_token_invalid',
]);

function done(appOrigin: string, transaction: TAuth0Transaction, result: { link: 'success' } | { link_error: string }): NextResponse {
  const url = new URL(transaction.redirect, appOrigin);
  const [name, value] = Object.entries(result)[0] as [string, string];
  url.searchParams.set(name, value);
  url.hash = 'security';
  const response = NextResponse.redirect(url);
  response.cookies.set(AUTH0_TXN_COOKIE, '', { path: '/api/auth', maxAge: 0 });
  return response;
}

async function currentUserId(accessToken: string): Promise<string | null> {
  const response = await fetch(getBackendAuthUrl(API_ENDPOINTS.auth.verify), {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    return null;
  }
  const body = await parseBackendResponse<{ id?: string }>(response) as { id?: string };
  return typeof body.id === 'string' ? body.id : null;
}

/** A link that did not get as far as the BE: Auth0 refused or the user cancelled, or the state did not match. */
export function linkFailed(appOrigin: string, transaction: TAuth0Transaction): NextResponse {
  return done(appOrigin, transaction, { link_error: 'link_failed' });
}

/**
 * Finishes a link started by /api/auth/link. The User's own session stays as it is: no access or refresh cookie is written,
 * because the tokens Auth0 just returned belong to the other sign-in method. The ID token is only handed to the BE as proof.
 */
export async function finishLink(appOrigin: string, transaction: TAuth0Transaction, code: string, accessToken: string | undefined): Promise<NextResponse> {
  try {
    // The session must still be the User who started the link, or a different person could attach their login to someone else.
    if (!accessToken || !transaction.userId || (await currentUserId(accessToken)) !== transaction.userId) {
      return done(appOrigin, transaction, { link_error: 'link_session_changed' });
    }

    const tokens = await exchangeCode(getAuth0Config(), { code, verifier: transaction.verifier, redirectUri: `${appOrigin}${AUTH0_CALLBACK_PATH}` });
    if (!tokens?.idToken) {
      return done(appOrigin, transaction, { link_error: 'link_failed' });
    }

    const response = await fetch(getBackendAuthUrl(API_ENDPOINTS.auth.link), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify({ idToken: tokens.idToken }),
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) {
      return done(appOrigin, transaction, { link: 'success' });
    }
    const body = await parseBackendResponse<unknown>(response) as { message?: unknown };
    const message = typeof body.message === 'string' ? body.message : '';
    logger.warn('Account link rejected:', { status: response.status, message });
    return done(appOrigin, transaction, { link_error: KNOWN_LINK_ERRORS.has(message) ? message : 'link_failed' });
  } catch (error) {
    logger.error('Account link failed:', { error });
    return done(appOrigin, transaction, { link_error: 'link_failed' });
  }
}
