import { test, expect } from '@playwright/test';

test.describe('Auth flow E2E', () => {
  test('login with valid credentials (uses seeded admin)', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example\.com/i).fill('admin@library.com');
    await page.getByPlaceholder(/••••••••/).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: /my books/i })).toBeVisible();
  });
});
