import { test, expect } from '@playwright/test';

test.describe('Digital Library E2E', () => {
  test('home page loads and shows navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /digital library/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /browse/i })).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /sign up|create account/i })).toBeVisible();
  });

  test('unauthenticated user redirected from my-books', async ({ page }) => {
    await page.goto('/my-books');
    await expect(page).toHaveURL(/\/login/);
  });
});
