import { test, expect } from '@playwright/test'

test.describe('Simulator Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulator')
  })

  test('should load the simulator interface @smoke', async ({ page }) => {
    // Check that the simulator loads
    await expect(page).toHaveTitle(/Simulator.*TOC/i)
    
    // Check for key simulator elements
    await expect(page.getByTestId('react-flow')).toBeVisible()
    await expect(page.getByRole('button', { name: /add state/i })).toBeVisible()
  })

  test('should allow creating states', async ({ page }) => {
    // Click add state button
    const addStateButton = page.getByRole('button', { name: /add state/i })
    await addStateButton.click()
    
    // Verify state was created
    await expect(page.locator('[data-testid^="state-node"]')).toHaveCount(1)
  })

  test('should have keyboard shortcuts working', async ({ page }) => {
    // Test keyboard shortcut for adding state (Ctrl+N or Cmd+N)
    const isMac = process.platform === 'darwin'
    const modifier = isMac ? 'Meta' : 'Control'
    
    await page.keyboard.press(`${modifier}+KeyN`)
    
    // Verify state was created via keyboard shortcut
    await expect(page.locator('[data-testid^="state-node"]')).toHaveCount(1)
  })

  test('should be responsive on mobile @accessibility', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip('This test is only for mobile devices')
    }
    
    // Check that simulator is usable on mobile
    await expect(page.getByTestId('react-flow')).toBeVisible()
    
    // Check that controls are accessible
    const controls = page.getByTestId('react-flow-controls')
    await expect(controls).toBeVisible()
  })
})
