import { Buffer } from 'node:buffer';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Env } from '@/libs/Env';

export const AUTH0_TXN_COOKIE = 'auth0_txn';
export const AUTH0_TXN_MAX_AGE_SECONDS = 600;
export const AUTH0_CALLBACK_PATH = '/api/auth/callback';
const SCOPE = 'openid profile email offline_access';
// Linking another sign-in method only needs the ID token, so no refresh token is requested.
export const LINK_SCOPE = 'openid profile email';
/** The BE accepts a link proof whose sign-in is at most this old (ADR 0004), so Auth0 is told to demand a fresh one. */
export const LINK_MAX_AGE_SECONDS = 300;
/** Where a link starts and ends: the Security tab of the profile page. */
export const LINK_RETURN_PATH = '/profile';
export const AUTH0_CONNECTIONS = { google: 'google-oauth2' } as const;
const REQUEST_TIMEOUT_MS = 10_000;

export type TAuth0Config = {
  domain: string;
  clientId: string;
  clientSecret: string;
  audience: string;
};

export type TAuth0Transaction = {
  state: string;
  verifier: string;
  redirect: string;
  /** `link` connects another sign-in method to the signed-in User instead of signing in. */
  purpose: 'login' | 'link';
  /** The User who started the link. A consistency check only: the BE decides ownership from its own nonce and the session. */
  userId?: string;
};

export type TAuth0Tokens = {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
};

/** Reads the Auth0 settings; throws (never returns a half-filled config) so a misconfigured deploy fails loudly. */
export function getAuth0Config(): TAuth0Config {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE } = Env;
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !AUTH0_AUDIENCE) {
    throw new Error('Auth0 is not configured: set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET and AUTH0_AUDIENCE');
  }
  return {
    domain: AUTH0_DOMAIN.replace(/^https?:\/\//, '').replace(/\/+$/, ''),
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    audience: AUTH0_AUDIENCE,
  };
}

/** Public origin of this app. NEXT_PUBLIC_APP_URL wins because the request origin is wrong behind some proxies. */
export function getAppOrigin(requestOrigin: string): string {
  return (Env.NEXT_PUBLIC_APP_URL || requestOrigin).replace(/\/+$/, '');
}

/** Only same-site relative paths are allowed, so the redirect target cannot send a user off-site. */
export function safeRedirectPath(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  try {
    const url = new URL(value, 'http://local.app');
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function createTransaction(redirect: string, link?: { userId: string }): { transaction: TAuth0Transaction; challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  return {
    transaction: {
      state: randomBytes(16).toString('base64url'),
      verifier,
      redirect,
      ...(link ? { purpose: 'link' as const, userId: link.userId } : { purpose: 'login' as const }),
    },
    challenge: createHash('sha256').update(verifier).digest('base64url'),
  };
}

/** Lax so the cookie comes back on Auth0's top-level redirect to the callback; path-scoped to the auth routes. */
export function transactionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: AUTH0_TXN_MAX_AGE_SECONDS,
  };
}

export function parseTransaction(raw: string | undefined): TAuth0Transaction | null {
  if (!raw) {
    return null;
  }
  try {
    const value = JSON.parse(raw) as Partial<TAuth0Transaction>;
    if (typeof value.state === 'string' && typeof value.verifier === 'string' && typeof value.redirect === 'string') {
      // Transactions written before `purpose` existed are logins.
      const isLink = value.purpose === 'link' && typeof value.userId === 'string' && value.userId.length > 0;
      return {
        state: value.state,
        verifier: value.verifier,
        redirect: value.redirect,
        ...(isLink ? { purpose: 'link' as const, userId: value.userId } : { purpose: 'login' as const }),
      };
    }
  } catch {}
  return null;
}

export function statesMatch(expected: string, received: string | null): boolean {
  if (!received) {
    return false;
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function buildAuthorizeUrl(
  config: TAuth0Config,
  params: {
    redirectUri: string;
    state: string;
    challenge: string;
    signup?: boolean;
    googleOnly?: boolean;
    locale?: string;
    /** Link mode: the connection to use, the BE's nonce, and a forced fresh sign-in. */
    connection?: string;
    nonce?: string;
    forceLogin?: boolean;
    maxAgeSeconds?: number;
    scope?: string;
  },
): string {
  const url = new URL(`https://${config.domain}/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('audience', config.audience);
  url.searchParams.set('scope', params.scope ?? SCOPE);
  url.searchParams.set('state', params.state);
  url.searchParams.set('code_challenge', params.challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  if (params.signup) {
    url.searchParams.set('screen_hint', 'signup');
  }
  if (params.googleOnly) {
    url.searchParams.set('connection', AUTH0_CONNECTIONS.google);
  }
  if (params.connection) {
    url.searchParams.set('connection', params.connection);
  }
  if (params.nonce) {
    url.searchParams.set('nonce', params.nonce);
  }
  if (params.forceLogin) {
    url.searchParams.set('prompt', 'login');
  }
  if (params.maxAgeSeconds !== undefined) {
    url.searchParams.set('max_age', String(params.maxAgeSeconds));
  }
  // Universal Login does not read the app's locale cookie; this tells Auth0 which language to show.
  if (params.locale) {
    url.searchParams.set('ui_locales', params.locale);
  }
  return url.toString();
}

export function buildLogoutUrl(config: TAuth0Config, returnTo: string): string {
  const url = new URL(`https://${config.domain}/v2/logout`);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('returnTo', returnTo);
  return url.toString();
}

async function requestTokens(config: TAuth0Config, body: Record<string, string>): Promise<{ status: number; data: Record<string, unknown> }> {
  const response = await fetch(`https://${config.domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: config.clientId, client_secret: config.clientSecret, ...body }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const data = await response.json().catch(() => ({})) as Record<string, unknown>;
  return { status: response.status, data };
}

function readTokens(data: Record<string, unknown>): TAuth0Tokens | null {
  if (typeof data.access_token !== 'string' || data.access_token.length === 0) {
    return null;
  }
  return {
    accessToken: data.access_token,
    refreshToken: typeof data.refresh_token === 'string' && data.refresh_token ? data.refresh_token : null,
    idToken: typeof data.id_token === 'string' && data.id_token ? data.id_token : null,
  };
}

/** Returns null on any failure; the caller only needs to know the login did not work. */
export async function exchangeCode(config: TAuth0Config, params: { code: string; verifier: string; redirectUri: string }): Promise<TAuth0Tokens | null> {
  const { status, data } = await requestTokens(config, {
    grant_type: 'authorization_code',
    code: params.code,
    code_verifier: params.verifier,
    redirect_uri: params.redirectUri,
  });
  return status === 200 ? readTokens(data) : null;
}

/** With rotation on, Auth0 returns a new refresh token; without it the old one stays valid. */
export async function refreshTokens(config: TAuth0Config, refreshToken: string): Promise<TAuth0Tokens | null> {
  const { status, data } = await requestTokens(config, { grant_type: 'refresh_token', refresh_token: refreshToken });
  const tokens = status === 200 ? readTokens(data) : null;
  return tokens && { ...tokens, refreshToken: tokens.refreshToken ?? refreshToken };
}
