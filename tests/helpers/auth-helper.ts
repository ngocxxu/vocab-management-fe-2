import type { Page } from '@playwright/test';

export async function loginHelper(page: Page, email: string, password: string) {
  await page.goto('/signin');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard|\/vocab-list/, { timeout: 10000 });
}

export async function logoutHelper(page: Page) {
  const avatarButton = page.getByRole('button', { name: /avatar|profile|user/i }).first();
  if (await avatarButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await avatarButton.click();
    await page.getByRole('button', { name: /logout|sign out/i }).click();
  } else {
    await page.goto('/signin');
  }
  await page.waitForURL(/\/signin/, { timeout: 5000 });
}

export async function clearAuthCookies(page: Page) {
  await page.context().clearCookies();
}

export async function setAuthCookie(page: Page, token: string) {
  await page.context().addCookies([{
    name: 'accessToken',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
  }]);
}
