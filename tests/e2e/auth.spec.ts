import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="username"]', 'MarcoBischero');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');

        // Expect to be redirected to home or dashboard
        await expect(page).toHaveURL('/');
        // Check for a logout button or user profile to confirm login
        // Assuming there's a sidebar or header
        // await expect(page.locator('text=MarcoBischero')).toBeVisible(); 
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="username"]', 'WrongUser');
        await page.fill('input[name="password"]', 'WrongPass');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });
});
