import { expect, test } from "./fixtures"
import { OverlayPage } from "./page-objects/OverlayPage"
import {
  PRIMARY_PRODUCT_ID,
  SECONDARY_PRODUCT_ID,
  TEST_CONFIG
} from "./test-config"
import { navigateToProduct } from "./utils/extension-helpers"

test.describe('ThinkTwice "Close and Pause" Flow', () => {
  test('should handle "Close for now" (Global Close)', async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()
    const productId = PRIMARY_PRODUCT_ID

    // Clear storage
    await extensionHelper.clearStorage()

    // Navigate to Amazon product page
    await navigateToProduct(page, productId)

    // Create overlay page object
    const overlayPage = new OverlayPage(page, extensionId)

    // Wait for the overlay
    await overlayPage.expectAttached()

    // Click the Close (X) button in the header
    await overlayPage.clickClose()

    // Verify Pause Menu is visible
    await overlayPage.expectTextVisible(TEST_CONFIG.TEXT.PAUSE_MENU_TITLE, 5000)

    // Click "Close for now"
    const closeForNowButton = overlayPage
      .getOverlayHost()
      .locator('button:has-text("Close for now")')
    await closeForNowButton.click()

    // Verify overlay is gone
    await overlayPage.expectHidden(5000)

    // Reload the same page
    await page.reload({ waitUntil: "load" })

    // Verify overlay remains hidden in this tab
    await overlayPage.expectHidden(5000)

    // Open a NEW tab to the same product
    const newPage = await extensionContext.newPage()
    await navigateToProduct(newPage, productId)

    // Verify overlay is NOT visible in the new tab (global close affects all tabs)
    const newOverlayPage = new OverlayPage(newPage, extensionId)
    await newOverlayPage.expectHidden(10000)
  })

  test('should handle "Pause for 1 hour" (Global Snooze)', async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()
    const productId1 = SECONDARY_PRODUCT_ID
    const productId2 = PRIMARY_PRODUCT_ID

    // Clear storage
    await extensionHelper.clearStorage()

    // Navigate to Amazon product page
    await navigateToProduct(page, productId1)

    // Create overlay page object
    const overlayPage = new OverlayPage(page, extensionId)

    // Wait for the overlay
    await overlayPage.expectAttached()

    // Open Pause Menu
    await overlayPage.clickClose()

    // Click "Pause for 1 hour"
    const pause1HourButton = overlayPage
      .getOverlayHost()
      .locator('button:has-text("Pause for 1 hour")')
    await pause1HourButton.click()

    // Verify overlay is gone
    await overlayPage.expectHidden(5000)

    // Navigate to a DIFFERENT product page in a NEW tab
    const newPage = await extensionContext.newPage()
    await navigateToProduct(newPage, productId2)

    // Verify overlay is NOT shown (global snooze active)
    const newOverlayPage = new OverlayPage(newPage, extensionId)
    await newOverlayPage.expectHidden(10000)
  })

  test('should handle "Cancel" in Pause Menu', async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()
    const productId = PRIMARY_PRODUCT_ID

    // Clear storage
    await extensionHelper.clearStorage()

    // Navigate to Amazon product page
    await navigateToProduct(page, productId)

    // Create overlay page object
    const overlayPage = new OverlayPage(page, extensionId)

    // Wait for the overlay
    await overlayPage.expectAttached()

    // Open Pause Menu
    await overlayPage.clickClose()

    // Click "Cancel"
    const cancelButton = overlayPage
      .getOverlayHost()
      .locator('button:has-text("Cancel")')
    await cancelButton.click()

    // Verify Pause Menu is gone but Overlay is still there
    await overlayPage.expectTextHidden(TEST_CONFIG.TEXT.PAUSE_MENU_TITLE, 5000)

    await expect(overlayPage.getButton(/I don't really need it/i)).toBeVisible({
      timeout: 5000
    })
  })

  test("should handle debug pause for 30 seconds globally and expire", async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    // Increase timeout for this test as it involves waiting for 30s
    test.setTimeout(70000)

    const page = await extensionContext.newPage()
    const productId1 = SECONDARY_PRODUCT_ID
    const productId2 = PRIMARY_PRODUCT_ID

    // Clear storage
    await extensionHelper.clearStorage()

    // Navigate to Amazon product page
    await navigateToProduct(page, productId1)

    // Create overlay page object
    const overlayPage = new OverlayPage(page, extensionId)

    // Wait for the overlay
    await overlayPage.expectAttached()

    // Open Pause Menu
    await overlayPage.clickClose()

    // Click "Pause for 30 seconds"
    const pause30sButton = overlayPage
      .getOverlayHost()
      .locator('button:has-text("Pause for 30 seconds")')
    await expect(pause30sButton).toBeVisible({ timeout: 5000 })
    await pause30sButton.click()

    // Verify overlay is gone in CURRENT tab
    await overlayPage.expectHidden(5000)

    // Open a NEW tab immediately
    console.log("Opening new tab to verify global snooze...")
    const newPage = await extensionContext.newPage()
    await navigateToProduct(newPage, productId2)

    // Verify overlay is NOT visible in the new tab (global snooze active)
    const newOverlayPage = new OverlayPage(newPage, extensionId)
    await newOverlayPage.expectHidden(10000)
    console.log("Verified: Overlay hidden in new tab due to global snooze.")

    // Wait for snooze to expire (31 seconds to be safe)
    console.log("Waiting 31 seconds for snooze to expire...")
    await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.SNOOZE_30S)

    // Reload the NEW tab
    console.log("Reloading new tab...")
    await newPage.reload({ waitUntil: "load" })

    // Verify overlay IS visible again in the new tab
    console.log("Waiting for overlay to reappear in new tab...")
    await newOverlayPage.expectAttached(30000)
    await newOverlayPage.expectTextVisible("ThinkTwice")
    console.log("Overlay reappeared successfully in new tab!")
  })
})
