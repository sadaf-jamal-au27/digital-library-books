import { test, expect } from '@playwright/test';

test.describe('Library E2E', () => {
  test('home shows discover title and browse', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /discover your next read/i })).toBeVisible();
  });

  test('after login can open My Books', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/you@example\.com/i).fill('admin@library.com');
    await page.getByPlaceholder(/••••••••/).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/');
    await page.getByRole('link', { name: /my books/i }).click();
    await expect(page).toHaveURL('/my-books');
    await expect(page.getByRole('heading', { name: /my library/i })).toBeVisible();
  });

  test('clicking a book goes to detail (when books exist)', async ({ page }) => {
    await page.goto('/');
    const bookLink = page.getByRole('link', { name: /the great gatsby|to kill a mockingbird|1984|pride and prejudice/i }).first();
    const count = await bookLink.count();
    if (count > 0) {
      await bookLink.click();
      await expect(page).toHaveURL(/\/book\/[a-f0-9]+/);
    }
  });
});
