import { expect, test } from "./fixtures"
import { OverlayPage } from "./page-objects/OverlayPage"
import { TEST_CONFIG, PRIMARY_PRODUCT_ID } from "./test-config"
import { navigateToProduct } from "./utils/extension-helpers"
import { buildProductId } from "./utils/product-helpers"

test.describe('ThinkTwice "I don\'t really need it" Flow', () => {
  test('should complete the "I don\'t really need it" flow', async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()
    const productId = PRIMARY_PRODUCT_ID

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to a known valid Amazon product page
    await navigateToProduct(page, productId)

    // Create overlay page object
    const overlayPage = new OverlayPage(page, extensionId)

    // Wait for the overlay to be attached
    await overlayPage.expectAttached()

    // Click "I don't really need it"
    await overlayPage.clickIDontNeedIt()

    // Verify Celebration View
    await overlayPage.expectCelebrationVisible(
      TEST_CONFIG.TEXT.CELEBRATION_DONT_NEED
    )

    // Verify product state is saved to storage
    const expectedProductId = buildProductId("amazon", productId)
    await extensionHelper.assertProductState(
      expectedProductId,
      TEST_CONFIG.STATES.DONT_NEED_IT
    )

    // Verify tab closes or overlay disappears after celebration (4 seconds)
    try {
      await page.waitForTimeout(5000)
      if (!page.isClosed()) {
        await overlayPage.expectHidden(2000)
      }
    } catch {
      expect(page.isClosed()).toBe(true)
      console.log("[Test] Tab was closed as expected")
    }
  })
})
