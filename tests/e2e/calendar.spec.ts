import { test, expect } from '@playwright/test';

test.describe('Calendar', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[name="username"]', 'MarcoBischero');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');
    });

    test('should navigate to calendar', async ({ page }) => {
        // Assuming there is a navigation link to calendar
        // If not, we go directly
        await page.goto('/calendar');

        // Check if the calendar page loads
        // Need to verify what is on the calendar page
        await expect(page).toHaveURL('/calendar');
        // await expect(page.locator('text=Calendario')).toBeVisible(); 
    });
});
