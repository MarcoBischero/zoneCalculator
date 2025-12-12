import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[name="username"]', 'MarcoBischero');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');
    });

    test('should complete the onboarding wizard', async ({ page }) => {
        // Force navigation to onboarding
        await page.goto('/onboarding');

        test.slow(); // Increase timeout
        // Wait for title
        // await expect(page.getByText('Misure', { exact: false })).toBeVisible();

        // Step 1: Measurements
        // Set Gender to Male (uomo)
        await page.locator('select').selectOption('uomo');

        // Fill inputs by order (skipping hips)
        // 0: Weight, 1: Height, 2: Waist, 3: Neck
        const inputs = page.locator('input[type="number"]');
        await inputs.nth(0).fill('80'); // Weight
        await inputs.nth(1).fill('180'); // Height
        await inputs.nth(2).fill('90'); // Waist
        await inputs.nth(3).fill('40'); // Neck

        // Click Next
        await page.getByRole('button', { name: /Prossimo|Next/i }).click();

        // Step 2: Activity
        await expect(page.locator('h3', { hasText: /Attività|Activity/ })).toBeVisible();

        // Select activity
        await page.locator('text=Moderato').click();

        // Submit
        await page.getByRole('button', { name: /Calcola|Calculate/i }).click();

        // Should return home
        await expect(page).toHaveURL('/');
    });
});
