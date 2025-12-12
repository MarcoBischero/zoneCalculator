import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'MarcoBischero');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');
    });

    test('should update profile name', async ({ page }) => {
        await page.goto('/settings');

        // Change name
        const nameInput = page.locator('input[name="nome"]');
        await nameInput.fill('Marco Test Updated');

        // Save
        await page.click('button:has-text("Salva Modifiche")'); // Assuming IT default

        // Expect success message
        await expect(page.locator('text=Successo')).toBeVisible();

        // Reload and verify
        await page.reload();
        await expect(nameInput).toHaveValue('Marco Test Updated');
    });

    // Note: Password test skipped to avoid locking out the test user for other tests
    // unless we reset it at the end.
});
