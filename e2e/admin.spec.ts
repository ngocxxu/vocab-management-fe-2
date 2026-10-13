import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { ADMIN_AUTH_FILE, TARGET_USER } from './fixtures';
import { signUpViaApi } from './signup';

// One admin session walks every admin area in order. Nothing signs out, so the last check proves the
// session survived the whole run.
test.use({ storageState: ADMIN_AUTH_FILE });
test.describe.configure({ mode: 'serial' });

const RUN_ID = process.env.E2E_RUN_ID;
const LANGUAGE = { name: `E2E Language ${RUN_ID}`, code: 'zzq' };
const BROADCAST = `E2E broadcast ${RUN_ID}`;
// Far in the future, so the broadcast stays active for the whole run.
const BROADCAST_EXPIRES_AT = '2099-01-01T10:00';
const CHAT_PROVIDER = 'Groq';

function userRow(page: Page): Locator {
  return page.getByRole('row').filter({ hasText: TARGET_USER.email });
}

test.beforeAll(() => signUpViaApi(TARGET_USER));

test('the overview loads for an admin', async ({ page }) => {
  await page.goto('/admin');

  await expect(page.getByRole('navigation', { name: 'Admin sections' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Overview', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('changes a role, deactivates and reactivates, then deletes a user', async ({ page }) => {
  await page.goto('/admin/users');
  await page.getByPlaceholder('Search by name or email').fill(TARGET_USER.email);
  const row = userRow(page);
  await expect(row).toBeVisible();

  await row.getByRole('combobox', { name: 'Change role' }).click();
  await page.getByRole('option', { name: 'Member', exact: true }).click();
  await expect(page.getByText('Role updated')).toBeVisible();

  await row.getByRole('button', { name: 'Deactivate', exact: true }).click();
  await expect(page.getByText('User deactivated')).toBeVisible();
  await row.getByRole('button', { name: 'Reactivate', exact: true }).click();
  await expect(page.getByText('User reactivated')).toBeVisible();

  await row.getByRole('button', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('alertdialog');
  await dialog.getByLabel(`Type ${TARGET_USER.email} to confirm`).fill(TARGET_USER.email);
  await dialog.getByRole('button', { name: 'Delete user', exact: true }).click();
  await expect(page.getByText('User deleted')).toBeVisible();
  await expect(userRow(page)).toHaveCount(0);
});

test('adds and deletes a language', async ({ page }) => {
  await page.goto('/admin/languages');
  await page.getByRole('button', { name: 'Add language', exact: true }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name', { exact: true }).fill(LANGUAGE.name);
  await dialog.getByLabel('Code', { exact: true }).fill(LANGUAGE.code);
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Language added')).toBeVisible();

  const row = page.getByRole('row').filter({ hasText: LANGUAGE.name });
  await row.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete language', exact: true }).click();
  await expect(page.getByText('Language deleted')).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: LANGUAGE.name })).toHaveCount(0);
});

test('sends a broadcast to all active users', async ({ page }) => {
  await page.goto('/admin/broadcasts');
  await page.getByLabel('Message', { exact: true }).fill(BROADCAST);
  await page.getByLabel('Expires at').fill(BROADCAST_EXPIRES_AT);
  await page.getByRole('button', { name: 'Send message', exact: true }).click();

  await expect(page.getByText('Message sent')).toBeVisible();
  await expect(page.getByText(BROADCAST, { exact: true })).toBeVisible();
});

test('sets and resets the chat provider', async ({ page }) => {
  await page.goto('/admin/system');
  const field = page.getByRole('group', { name: 'Chat provider' });
  const provider = field.getByRole('combobox', { name: 'Chat provider' });

  await provider.click();
  await page.getByRole('option', { name: CHAT_PROVIDER, exact: true }).click();
  await field.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('AI setting saved')).toBeVisible();
  await expect(provider).toHaveText(CHAT_PROVIDER);

  await field.getByRole('button', { name: 'Reset to env default', exact: true }).click();
  await expect(page.getByText('AI setting reset to env default')).toBeVisible();
  await expect(provider).toHaveText('env default');
});

test('the admin is still signed in at the end', async ({ page }) => {
  await page.goto('/admin');

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('navigation', { name: 'Admin sections' })).toBeVisible();
});
