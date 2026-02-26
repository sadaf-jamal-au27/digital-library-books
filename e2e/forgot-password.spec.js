import { test, expect } from '@playwright/test';

test.describe('Forgot password E2E', () => {
  test('forgot password page loads and shows step 1', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /send otp/i })).toBeVisible();
  });

  test('back to log in link works', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByRole('link', { name: /back to log in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
