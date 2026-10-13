import { expect, request } from '@playwright/test';
import type { TE2eUser } from './fixtures';
import { API } from './fixtures';

// Creates the user through the backend API, skipping the signup form. Callers run it before any sign-in,
// so the user exists when the spec needs it.
export async function signUpViaApi(user: TE2eUser): Promise<void> {
  const api = await request.newContext();
  try {
    const response = await api.post(`${API}/auth/signup`, {
      data: { ...user, phone: '', avatar: '' },
    });
    expect(response.ok(), await response.text()).toBe(true);
  } finally {
    await api.dispose();
  }
}
