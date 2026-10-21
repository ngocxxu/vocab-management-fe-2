import type { TAuth0Transaction } from '@/libs/auth0';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { finishLink, linkFailed } from './link';

vi.mock('@/libs/Env', () => ({
  Env: { AUTH0_DOMAIN: 'tenant.example.auth0.com', AUTH0_CLIENT_ID: 'cid', AUTH0_CLIENT_SECRET: 'secret', AUTH0_AUDIENCE: 'https://api.test' },
}));
vi.mock('@/libs/Logger', () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const APP = 'http://app.test';
const transaction: TAuth0Transaction = { state: 's', verifier: 'v', redirect: '/profile', purpose: 'link', userId: 'user-1' };

type TBackendStub = { sessionUserId?: string | null; tokenBody?: Record<string, unknown>; link?: { status: number; body: unknown } };

function stubFetch({ sessionUserId = 'user-1', tokenBody = { access_token: 'other-at', id_token: 'id-token-b' }, link = { status: 200, body: { methods: ['google', 'password'] } } }: TBackendStub = {}) {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.endsWith('/auth/verify')) {
      return sessionUserId ? new Response(JSON.stringify({ id: sessionUserId }), { status: 200 }) : new Response('{}', { status: 401 });
    }
    if (url.endsWith('/oauth/token')) {
      return new Response(JSON.stringify(tokenBody), { status: 200 });
    }
    if (url.endsWith('/auth/identities/link')) {
      return new Response(JSON.stringify(link.body), { status: link.status });
    }
    throw new Error(`unexpected request ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const calledUrls = (fetchMock: ReturnType<typeof stubFetch>) => fetchMock.mock.calls.map(([url]) => String(url));

describe('finishLink', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('hands the ID token to the BE with the User\'s own session and writes no session cookie', async () => {
    const fetchMock = stubFetch();

    const response = await finishLink(APP, transaction, 'code', 'session-at');

    expect(response.headers.get('location')).toBe(`${APP}/profile?link=success#security`);
    const linkCall = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/auth/identities/link')) as unknown as [string, RequestInit];
    expect(linkCall[1].headers).toMatchObject({ Authorization: 'Bearer session-at' });
    expect(JSON.parse(linkCall[1].body as string)).toEqual({ idToken: 'id-token-b' });
    const cookies = response.headers.getSetCookie().join(';');
    expect(cookies).not.toContain('accessToken');
    expect(cookies).not.toContain('refreshToken');
    expect(cookies).toContain('auth0_txn=;');
  });

  it('refuses when the session now belongs to a different User, before any code is exchanged', async () => {
    const fetchMock = stubFetch({ sessionUserId: 'someone-else' });

    const response = await finishLink(APP, transaction, 'code', 'session-at');

    expect(response.headers.get('location')).toContain('link_error=link_session_changed');
    expect(calledUrls(fetchMock).some(url => url.endsWith('/oauth/token'))).toBe(false);
  });

  it('refuses when there is no session at all', async () => {
    const fetchMock = stubFetch();

    const response = await finishLink(APP, transaction, 'code', undefined);

    expect(response.headers.get('location')).toContain('link_error=link_session_changed');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a transaction that does not say which User started it', async () => {
    stubFetch();

    const response = await finishLink(APP, { ...transaction, userId: undefined }, 'code', 'session-at');

    expect(response.headers.get('location')).toContain('link_error=link_session_changed');
  });

  it('fails the link when Auth0 sends no ID token', async () => {
    const fetchMock = stubFetch({ tokenBody: { access_token: 'other-at' } });

    const response = await finishLink(APP, transaction, 'code', 'session-at');

    expect(response.headers.get('location')).toContain('link_error=link_failed');
    expect(calledUrls(fetchMock).some(url => url.endsWith('/auth/identities/link'))).toBe(false);
  });

  it.each([
    ['identity_already_linked', 409],
    ['email_not_verified', 403],
    ['link_proof_stale', 403],
    ['link_nonce_invalid', 403],
    ['id_token_invalid', 401],
  ])('passes the BE code %s on to the page', async (code, status) => {
    stubFetch({ link: { status, body: { message: code } } });

    const response = await finishLink(APP, transaction, 'code', 'session-at');

    expect(response.headers.get('location')).toContain(`link_error=${code}`);
  });

  it('shows an unknown BE failure as a generic one', async () => {
    stubFetch({ link: { status: 500, body: { message: 'Internal server error' } } });

    const response = await finishLink(APP, transaction, 'code', 'session-at');

    expect(response.headers.get('location')).toContain('link_error=link_failed');
  });
});

describe('linkFailed', () => {
  it('goes back to the profile with a generic failure and clears the transaction', () => {
    const response = linkFailed(APP, transaction);

    expect(response.headers.get('location')).toBe(`${APP}/profile?link_error=link_failed#security`);
    expect(response.headers.getSetCookie().join(';')).toContain('auth0_txn=;');
  });
});
