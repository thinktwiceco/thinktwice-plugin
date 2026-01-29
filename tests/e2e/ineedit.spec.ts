import { expect, test } from "./fixtures"
import { OverlayPage } from "./page-objects/OverlayPage"
import { TEST_CONFIG } from "./test-config"
import { navigateToProduct } from "./utils/extension-helpers"
import { buildProductId } from "./utils/product-helpers"

test.describe('ThinkTwice "I need it" Flow', () => {
  test('should complete the "I need it" flow and prevent overlay from reappearing', async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to product page
    await navigateToProduct(page, TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY)

    // Create overlay page object
    const overlayPage = new OverlayPage(page, extensionId)

    // Wait for the overlay to be attached
    await overlayPage.expectAttached()

    // Click "I need it"
    await overlayPage.clickINeedIt()

    // Verify Celebration View
    await overlayPage.expectCelebrationVisible(
      TEST_CONFIG.TEXT.CELEBRATION_NEED_IT
    )

    // Wait for auto-close delay
    await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.AUTO_CLOSE_DELAY)

    // Verify that the celebration closes
    await overlayPage.expectCelebrationHidden(
      TEST_CONFIG.TEXT.CELEBRATION_NEED_IT,
      2000
    )

    // Verify that no overlay is visible
    await overlayPage.expectHidden(2000)

    // Verify product state is saved to storage
    const expectedProductId = buildProductId(
      "amazon",
      TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY
    )
    await extensionHelper.assertProductState(
      expectedProductId,
      TEST_CONFIG.STATES.I_NEED_THIS
    )

    // Close the tab
    await page.close()

    // Navigate to the same product URL again
    const newPage = await extensionContext.newPage()
    await navigateToProduct(newPage, TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY)

    // Wait a bit for the extension to check the product state
    await newPage.waitForTimeout(2000)

    // Verify overlay does NOT appear
    const overlayPageReturn = new OverlayPage(newPage, extensionId)
    await overlayPageReturn.expectHidden(5000)
  })

  test('should show overlay for different product after clicking "I need it" on first product', async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to first product (PRIMARY)
    await navigateToProduct(page, TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY)

    // Create overlay page object
    const overlayPage = new OverlayPage(page, extensionId)

    // Wait for the overlay to be attached
    await overlayPage.expectAttached()

    // Click "I need it"
    await overlayPage.clickINeedIt()

    // Verify Celebration View
    await overlayPage.expectCelebrationVisible(
      TEST_CONFIG.TEXT.CELEBRATION_NEED_IT
    )

    // Wait for the celebration to auto-close and disappear
    await overlayPage.expectCelebrationHidden(
      TEST_CONFIG.TEXT.CELEBRATION_NEED_IT,
      TEST_CONFIG.TIMEOUTS.CELEBRATION_FADE
    )

    // Verify overlay is hidden for Product A after auto-close
    await overlayPage.expectHidden(2000)

    // Navigate to a different product (SECONDARY)
    await navigateToProduct(page, TEST_CONFIG.AMAZON_PRODUCT_IDS.SECONDARY)

    // Wait for extension to initialize after navigation
    await page.waitForTimeout(1000)

    // Create overlay page object for second product
    const overlayPageSecond = new OverlayPage(page, extensionId)

    // Wait for the overlay to appear for the second product
    await overlayPageSecond.expectAttached()

    // Verify overlay content is visible by checking for a button
    await expect(overlayPageSecond.getButton(/I need it/i)).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  })
})
