import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  const signUpPath = '/auth/jwt/sign-up';
  const signInPath = '/auth/jwt/sign-in';

  test('sign up then sign in', async ({ page }) => {
    const unique = `user${Date.now()}@example.com`;
    const password = 'P@ssword123';

    await page.goto(signUpPath);
    await page.getByLabel('First name').fill('Play');
    await page.getByLabel('Last name').fill('Wright');
    await page.getByLabel('Email address').fill(unique);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/dashboard/);

    await page.goto(signInPath);
    await page.getByLabel('Email address').fill(unique);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/dashboard/);
  });
});
