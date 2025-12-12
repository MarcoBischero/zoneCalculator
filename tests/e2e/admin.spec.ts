import { test, expect } from '@playwright/test';

test.describe('Admin Area', () => {
    test.beforeEach(async ({ page }) => {
        // Login as Admin
        await page.goto('/login');
        await page.fill('input[name="username"]', 'MarcoBischero');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');
    });

    test('should navigate to user list', async ({ page }) => {
        await page.goto('/admin/users');
        // Expect to see "Users" or "Gestione Utenti"
        await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();

        // Should see a table or list
        await expect(page.getByRole('table')).toBeVisible(); // Assuming Shadcn table
    });

    test('should be able to open add user dialog', async ({ page }) => {
        await page.goto('/admin/users');

        test.slow();
        // Click Add User button
        await page.getByText('Aggiungi', { exact: false }).first().click();

        // Expect Dialog
        await expect(page.getByRole('dialog')).toBeVisible();
        // await expect(page.getByRole('heading', { name: 'Aggiungi Nuovo Utente' })).toBeVisible();

        // Close it to be clean
        // await page.keyboard.press('Escape');
    });
});
