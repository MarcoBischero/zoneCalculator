import { test, expect } from '@playwright/test';

test.describe('Meal Calculator', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[name="username"]', 'MarcoBischero');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');
    });

    test('should be able to create a meal', async ({ page }) => {
        await page.goto('/calculator');

        // Check correct title
        await expect(page.getByRole('heading', { name: 'Meal Builder' })).toBeVisible();

        // Search for food
        const searchInput = page.getByPlaceholder("Search for food (e.g. 'Chicken', 'Apple')...");
        await searchInput.click();
        await searchInput.fill('Pollo');

        // Wait for results
        await expect(page.locator('button').filter({ hasText: 'Pollo' }).first()).toBeVisible();

        // Click first result
        await page.locator('button').filter({ hasText: 'Pollo' }).first().click();

        // Verify it was added to the list
        await expect(page.locator('text=Pollo').first()).toBeVisible();

        // Test Delete
        // Hover to show delete button
        await page.locator('text=Pollo').first().hover();

        // Click delete (X icon)
        // targeting the button that appears on hover
        await page.locator('.group:has-text("Pollo") button').click();

        // Verify it is gone
        await expect(page.locator('text=Pollo')).not.toBeVisible();
    });
});
