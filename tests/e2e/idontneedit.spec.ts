import { test } from "./fixtures"
import { OverlayPage } from "./page-objects/OverlayPage"
import { TEST_CONFIG } from "./test-config"
import { navigateToProduct } from "./utils/extension-helpers"
import { buildProductId } from "./utils/product-helpers"

test.describe('ThinkTwice "I don\'t really need it" Flow', () => {
  test('should complete the "I don\'t really need it" flow', async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to a known valid Amazon product page
    await navigateToProduct(page, TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY)

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
    const expectedProductId = buildProductId(
      "amazon",
      TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY
    )
    await extensionHelper.assertProductState(
      expectedProductId,
      TEST_CONFIG.STATES.DONT_NEED_IT
    )

    // Verify it auto-closes after roughly 4 seconds
    await overlayPage.expectCelebrationHidden(
      TEST_CONFIG.TEXT.CELEBRATION_DONT_NEED
    )
  })
})
