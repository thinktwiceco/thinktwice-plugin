import { expect, test } from "./fixtures"
import { OverlayPage } from "./page-objects/OverlayPage"
import { PRIMARY_PRODUCT_ID } from "./test-config"
import { navigateToProduct } from "./utils/extension-helpers"

test.describe("ThinkTwice Plugin E2E", () => {
  test("should show the ThinkTwice overlay on an Amazon product page", async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()
    page.on("console", (msg) => console.log("BROWSER LOG:", msg.text()))

    console.log("Extension ID:", extensionId)

    // Clear extension storage to ensure a clean state
    console.log("Clearing extension storage...")
    await extensionHelper.clearStorage()

    // Navigate to a known valid Amazon product page
    console.log("Navigating to Amazon product page...")
    await navigateToProduct(page, PRIMARY_PRODUCT_ID)

    // Create overlay page object
    const overlayPage = new OverlayPage(page, extensionId)

    // Wait for the overlay to be attached
    console.log("Waiting for overlay host...")
    await overlayPage.expectAttached()
    console.log("Overlay host discovered, waiting for internal content...")

    // Check for "ThinkTwice" text inside the shadow DOM
    await overlayPage.expectTextVisible("ThinkTwice")

    // Verify presence of buttons
    await expect(overlayPage.getButton(/I don't really need it/i)).toBeVisible()
    await expect(overlayPage.getButton(/Sleep on it/i)).toBeVisible()
    await expect(overlayPage.getButton(/I need it/i)).toBeVisible()
  })
})
