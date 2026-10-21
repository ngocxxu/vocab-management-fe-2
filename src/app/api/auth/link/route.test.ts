import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/libs/Env', () => ({
  Env: {
    AUTH0_DOMAIN: 'tenant.example.auth0.com',
    AUTH0_CLIENT_ID: 'cid',
    AUTH0_CLIENT_SECRET: 'secret',
    AUTH0_AUDIENCE: 'https://api.test',
    NEXT_PUBLIC_APP_URL: 'http://app.test',
  },
}));
vi.mock('@/libs/Logger', () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const APP = 'http://app.test';

function linkRequest(method: string | null, accessToken: string | null = 'at-a'): NextRequest {
  const body = method === null ? new URLSearchParams() : new URLSearchParams({ method });
  return new NextRequest(`${APP}/api/auth/link`, {
    method: 'POST',
    body,
    headers: accessToken ? { cookie: `accessToken=${accessToken}` } : {},
  });
}

/** Backend answers: `verify` returns the User, `link-nonce` returns a nonce (or fails when `nonce` is null). */
function stubBackend({ verifyOk = true, nonce = 'nonce-1' }: { verifyOk?: boolean; nonce?: string | null } = {}) {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.endsWith('/auth/verify')) {
      return verifyOk
        ? new Response(JSON.stringify({ id: 'user-1' }), { status: 200 })
        : new Response('{"message":"Unauthorized"}', { status: 401 });
    }
    if (url.endsWith('/auth/identities/link-nonce')) {
      return nonce === null
        ? new Response('{"message":"boom"}', { status: 500 })
        : new Response(JSON.stringify({ nonce }), { status: 201 });
    }
    throw new Error(`unexpected request ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('pOST /api/auth/link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('refuses a method that cannot be linked, without calling the backend', async () => {
    const fetchMock = stubBackend();

    const response = await POST(linkRequest('password'));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${APP}/profile?link_error=link_failed#security`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends a session-less request home', async () => {
    const response = await POST(linkRequest('google', null));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${APP}/`);
  });

  it('reports a changed session when the backend does not recognise the access token', async () => {
    stubBackend({ verifyOk: false });

    const response = await POST(linkRequest('google'));

    expect(response.headers.get('location')).toBe(`${APP}/profile?link_error=link_session_changed#security`);
  });

  it('reports a plain failure, not a changed session, when the nonce cannot be issued', async () => {
    stubBackend({ nonce: null });

    const response = await POST(linkRequest('google'));

    expect(response.headers.get('location')).toBe(`${APP}/profile?link_error=link_failed#security`);
  });

  it('sends Google through Auth0 with the nonce, a forced fresh sign-in, and a link transaction cookie', async () => {
    stubBackend();

    const response = await POST(linkRequest('google'));

    expect(response.status).toBe(303);
    const authorize = new URL(response.headers.get('location') ?? '');
    expect(authorize.origin).toBe('https://tenant.example.auth0.com');
    expect(authorize.searchParams.get('connection')).toBe('google-oauth2');
    expect(authorize.searchParams.get('nonce')).toBe('nonce-1');
    expect(authorize.searchParams.get('prompt')).toBe('login');
    expect(authorize.searchParams.get('max_age')).toBe('300');
    expect(response.cookies.get('auth0_txn')?.value).toContain('"purpose":"link"');
    expect(response.cookies.get('auth0_txn')?.value).toContain('"userId":"user-1"');
  });

  it('writes no session cookies: the User keeps their own', async () => {
    stubBackend();

    const response = await POST(linkRequest('google'));

    expect(response.cookies.get('accessToken')).toBeUndefined();
    expect(response.cookies.get('refreshToken')).toBeUndefined();
  });
});
