import * as auth0 from '@/libs/auth0';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/libs/Env', () => ({ Env: { NEXT_PUBLIC_APP_URL: 'http://app.test' } }));
vi.mock('@/libs/Logger', () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock('@/libs/auth0', () => ({
  AUTH0_CALLBACK_PATH: '/api/auth/callback',
  AUTH0_TXN_COOKIE: 'auth0_txn',
  exchangeCode: vi.fn(),
  getAppOrigin: (origin: string) => origin,
  getAuth0Config: () => ({}),
  parseTransaction: () => ({ state: 's', verifier: 'v', redirect: '/dashboard', purpose: 'login' }),
  statesMatch: () => true,
}));

const APP = 'http://app.test';

function callback(): NextRequest {
  return new NextRequest(`${APP}/api/auth/callback?code=c&state=s`, { headers: { cookie: 'auth0_txn=x' } });
}

/** The BE answers the sync call with the given refusal message. */
function stubSync(message: string) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ message }), { status: 403 })));
}

describe('callback route: a refused sync', () => {
  beforeEach(() => {
    vi.mocked(auth0.exchangeCode).mockResolvedValue({ accessToken: 'at', refreshToken: 'rt', idToken: null });
  });

  it('sends an unverified email to its own page, not the landing page', async () => {
    stubSync('email_not_verified');

    const response = await GET(callback());

    expect(response.headers.get('location')).toBe(`${APP}/verify-email`);
    expect(response.cookies.get('auth0_txn')?.value).toBe('');
  });

  it('hands that login\'s token to the verify page in a cookie scoped to it', async () => {
    stubSync('email_not_verified');

    const response = await GET(callback());

    const cookie = response.cookies.get('unverifiedAccessToken');
    expect(cookie?.value).toBe('at');
    expect(cookie?.path).toBe('/verify-email');
    expect(cookie?.httpOnly).toBe(true);
  });

  it('keeps the landing page and its error for any other refusal', async () => {
    stubSync('account_link_required');

    const response = await GET(callback());

    expect(response.headers.get('location')).toBe(`${APP}/?auth_error=account_link_required`);
    expect(response.cookies.get('unverifiedAccessToken')).toBeUndefined();
  });
});
