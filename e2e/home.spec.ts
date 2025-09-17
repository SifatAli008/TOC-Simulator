import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page successfully @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/TOC Simulator/i)
    
    // Check for key elements
    await expect(page.getByRole('heading', { name: /TOC Simulator/i })).toBeVisible()
    await expect(page.getByText(/Theory of Computation/i)).toBeVisible()
  })

  test('should have accessible navigation @accessibility', async ({ page }) => {
    await page.goto('/')
    
    // Check navigation accessibility
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()
    
    // Check that navigation links are keyboard accessible
    await page.keyboard.press('Tab')
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should navigate to simulator page', async ({ page }) => {
    await page.goto('/')
    
    // Find and click the simulator link
    const simulatorLink = page.getByRole('link', { name: /simulator/i })
    await simulatorLink.click()
    
    // Verify navigation
    await expect(page).toHaveURL(/simulator/)
    await expect(page.getByText(/Automata Editor/i)).toBeVisible()
  })

  test('should navigate to dashboard page', async ({ page }) => {
    await page.goto('/')
    
    // Find and click the dashboard link
    const dashboardLink = page.getByRole('link', { name: /dashboard/i })
    await dashboardLink.click()
    
    // Verify navigation
    await expect(page).toHaveURL(/dashboard/)
  })
})
