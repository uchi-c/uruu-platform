import { test, expect } from '@playwright/test';

// The "valid login" test needs a real seeded user with a KNOWN password. The
// project's real seed script (prisma/seed.ts) generates a random password by
// default and only prints it once — there is no fixed default credential to
// hardcode here. To run that test: set SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD,
// run `npx prisma db seed`, then `npm run test:e2e` with the same env vars set.
const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@shadowroot.tech';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

test.describe('Authentication', () => {
  test('redirects to login when visiting a protected route unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('login with invalid credentials shows an error, not a redirect', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('#login-email').fill('nobody@example.com');
    await page.locator('#login-password').fill('definitely-the-wrong-password');
    await page.getByRole('button', { name: /authenticate/i }).click();

    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('login with valid credentials reaches the dashboard', async ({ page }) => {
    test.skip(
      !SEED_ADMIN_PASSWORD,
      'Requires a seeded user with a known password — set SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD, ' +
        'run `npx prisma db seed`, then re-run with the same env vars set.'
    );

    await page.goto('/auth/login');
    await page.locator('#login-email').fill(SEED_ADMIN_EMAIL);
    await page.locator('#login-password').fill(SEED_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: /authenticate/i }).click();

    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
