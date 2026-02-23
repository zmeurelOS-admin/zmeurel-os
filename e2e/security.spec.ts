import { test, expect, Page } from '@playwright/test';

/**
 * Security Test Suite for Zmeurel OS
 * 
 * Tests RLS-First Architecture:
 * 1. Middleware protects all routes
 * 2. React Query cache is cleared on logout
 * 3. Backend RLS enforces tenant isolation
 */

// Test credentials
const USER_A = {
  email: 'user1@gmail.com',
  password: 'test1234',
};

const USER_B = {
  email: 'user2@gmail.com',
  password: 'test1234',
};

// Helper function to login via UI
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  
  // Fill login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Submit login
  await page.getByRole('button', { name: /submit/i }).click();
  
  // Wait for successful login redirect
  await page.waitForURL(/\/(dashboard|clienti|parcele|cheltuieli|recoltari|culegatori|investitii|vanzari|activitati-agricole)/, {
    timeout: 10000,
  });
}

// Helper function to get current date in ISO format (YYYY-MM-DD)
function getTodayISO(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

test.describe('RLS-First Security Tests', () => {
  
  test.describe.configure({ mode: 'serial' }); // Run tests in order
  
  /**
   * TEST 1: Middleware Security - Unauthenticated Access
   * 
   * Verifies that middleware blocks unauthenticated users from accessing
   * protected routes and redirects them to /login.
   */
  test('TEST 1: Middleware blocks unauthenticated access to /cheltuieli', async ({ page }) => {
    // Navigate directly to protected route without authentication
    await page.goto('/cheltuieli');
    
    // Assert strict redirect to /login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
    
    // Ensure no protected UI content is rendered
    // The page should show login form, not cheltuieli UI
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Ensure cheltuieli-specific content is NOT visible
    await expect(page.getByText(/cheltuiel/i).first()).not.toBeVisible();
  });

  /**
   * TEST 2: Cache Bleed & Tenant Isolation
   * 
   * This is the CRITICAL test that verifies:
   * 1. React Query cache is properly cleared on logout
   * 2. No cross-tenant data leakage in the UI
   * 3. Users can only see their own tenant's data
   */
  test('TEST 2: Cache cleared on logout - no cross-tenant UI bleed', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds timeout for this complex test
    
    const testCategory = 'Cheltuiala_UserA_Test';
    const todayISO = getTodayISO();
    
    // ============================================================
    // STEP 1: Login as User A
    // ============================================================
    await loginUser(page, USER_A.email, USER_A.password);
    console.log('✅ User A logged in');
    
    // ============================================================
    // STEP 2: Navigate to /cheltuieli and create a test record
    // ============================================================
    await page.goto('/cheltuieli');
    
    // Click "Adaugă" button to open dialog
    await page.getByRole('button', { name: /adaugă/i }).click();
    
    // Wait for dialog to be visible
    await expect(page.locator('select#categorie')).toBeVisible();
    
    // Fill the form
    await page.selectOption('select#categorie', 'Altele');
    await page.fill('input#suma_lei', '1');
    await page.fill('input#data', todayISO);
    await page.fill('textarea#descriere', testCategory);
    
    // Submit the form
    await page.getByRole('button', { name: /salvează/i }).click();
    
    // Verify the record is visible in User A's UI
    await expect(page.getByText(testCategory).first()).toBeVisible({ timeout: 10000 });
    console.log('✅ User A created test record');
    
    // ============================================================
    // STEP 3: Logout User A
    // ============================================================
    const logoutButton = page.getByRole('button', { name: /ieșire/i });
    await logoutButton.click();
    await page.waitForURL('**/login', { timeout: 15000 });
    console.log('✅ User A logged out');
    
    // ============================================================
    // STEP 4: Login as User B
    // ============================================================
    await loginUser(page, USER_B.email, USER_B.password);
    console.log('✅ User B logged in');
    
    // ============================================================
    // STEP 5: Navigate to /cheltuieli as User B
    // ============================================================
    await page.goto('/cheltuieli');
    
    // CRITICAL ASSERTION 1: User A's record should NOT be visible to User B
    await expect(page.getByText(testCategory)).not.toBeVisible();
    console.log('✅ User A\'s record NOT visible to User B (initial check)');
    
    // ============================================================
    // STEP 6: Reload the page to ensure no stale cache
    // ============================================================
    await page.reload();
    
    // CRITICAL ASSERTION 2: After reload, User A's record should STILL not be visible
    await expect(page.getByText(testCategory)).not.toBeVisible();
    console.log('✅ User A\'s record NOT visible to User B (after reload)');
    
    // Additional assertion: Ensure page loaded properly (not stuck on stale data)
    await expect(page.getByText(/cheltuiel/i).first()).toBeVisible();
  });

  /**
   * TEST 3: RLS Backend Enforcement (API-Level Verification)
   * 
   * Verifies that Supabase RLS policies enforce tenant isolation
   * at the database level, not just in the UI.
   */
  test('TEST 3: Backend RLS filters cheltuieli_diverse by tenant', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds timeout
    
    // Login as User B
    await loginUser(page, USER_B.email, USER_B.password);
    console.log('✅ User B logged in for API test');
    
    // Setup request interception for Supabase REST API
    let rlsVerified = false;
    
    page.on('response', async (response) => {
      const url = response.url();
      
      // Check if this is a Supabase REST call to cheltuieli_diverse table
      if (url.includes('/rest/v1/cheltuieli_diverse') && response.request().method() === 'GET') {
        console.log('📡 Intercepted Supabase API call:', url);
        
        try {
          const data = await response.json();
          console.log('📦 Response data:', JSON.stringify(data, null, 2));
          
          // Verify that the response does NOT contain User A's test record
          // The RLS policies should filter it out at the database level
          if (Array.isArray(data)) {
            const hasUserAData = data.some((record: any) => 
              record.descriere && record.descriere.includes('Cheltuiala_UserA_Test')
            );
            
            if (!hasUserAData) {
              console.log('✅ RLS VERIFIED: User A\'s data NOT in API response');
              rlsVerified = true;
            } else {
              console.error('❌ RLS FAILED: User A\'s data found in API response!');
            }
          }
        } catch (e) {
          // Not JSON or parsing failed - ignore
          console.log('⚠️  Response not JSON or parsing failed');
        }
      }
    });
    
    // Navigate to /cheltuieli to trigger API calls
    await page.goto('/cheltuieli');
    await expect(page.getByText(/cheltuiel/i).first()).toBeVisible();
    
    // Give it a moment to ensure all intercepted responses are processed
    await page.waitForTimeout(2000);
    
    // If we didn't intercept the API call, trigger it manually
    if (!rlsVerified) {
      console.log('⚠️  No API call intercepted during initial load, triggering reload...');
      await page.reload();
      await expect(page.getByText(/cheltuiel/i).first()).toBeVisible();
      await page.waitForTimeout(2000);
    }
    
    // CRITICAL ASSERTION: RLS should have been verified
    expect(rlsVerified).toBe(true);
  });
});