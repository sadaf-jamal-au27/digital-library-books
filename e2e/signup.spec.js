import { test, expect } from '@playwright/test';

test.describe('Signup E2E', () => {
  test('signup form submits and redirects to home', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    await page.goto('/signup');
    await page.getByPlaceholder(/your name/i).fill('E2E User');
    await page.getByPlaceholder(/you@example\.com/i).fill(email);
    await page.getByPlaceholder(/at least 6 characters/i).fill('password123');
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: /my books/i })).toBeVisible();
  });
});
