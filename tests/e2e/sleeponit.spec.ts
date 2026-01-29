import { expect, test } from "./fixtures"
import { OverlayPage } from "./page-objects/OverlayPage"
import { PopupPage } from "./page-objects/PopupPage"
import { TEST_CONFIG } from "./test-config"
import { navigateToProduct } from "./utils/extension-helpers"
import { extractProductInfo } from "./utils/product-helpers"

test.describe('ThinkTwice "Sleep on it" Flow', () => {
  test("should show celebration and close tab after setting 1 minute reminder (bug test)", async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to the test product page
    await navigateToProduct(page, TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY)

    // Create overlay page object
    const overlayPage = new OverlayPage(page, extensionId)

    // Wait for the overlay to be attached
    await overlayPage.expectAttached()

    // Click "Sleep on it"
    await overlayPage.clickSleepOnIt()

    // Verify we're in the Sleep on it view
    await overlayPage.expectTextVisible(TEST_CONFIG.TEXT.SLEEP_ON_IT_TITLE)

    // Select "1 minute" duration
    await overlayPage.selectDuration(/1 minute/i)

    // Click "Set Reminder"
    await overlayPage.clickSetReminder()

    // Verify success message appears
    await overlayPage.expectSuccessMessage()

    // BUG TEST: Wait a bit to see if the bug occurs (early return view appearing)
    await page.waitForTimeout(1000)

    // Check that we're NOT seeing the early return view
    await overlayPage.expectTextHidden("You're back!", 1000)

    // Check that we're NOT seeing "You waited for 0 seconds"
    await overlayPage.expectTextHidden("You waited for 0 seconds", 1000)

    // Verify the success message is still visible (not replaced by early return)
    await overlayPage.expectSuccessMessage(2000)

    // Expected behavior: Tab should close after 4 seconds or overlay disappears
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

  test("should display product in popup after setting 1 minute reminder", async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    // Set a longer timeout for this test since we need to wait for the 1 minute reminder
    test.setTimeout(120000) // 2 minutes

    const page = await extensionContext.newPage()

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to the test product page
    await navigateToProduct(page, TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY)

    // Extract product information
    const productInfo = await extractProductInfo(page)
    console.log(`[Test] Product Name: ${productInfo.name}`)
    console.log(`[Test] Product Price: ${productInfo.price}`)

    // Create overlay page object
    const overlayPage = new OverlayPage(page, extensionId)
    await overlayPage.expectAttached()

    // Complete sleep on it flow
    await overlayPage.clickSleepOnIt()
    await overlayPage.expectTextVisible(TEST_CONFIG.TEXT.SLEEP_ON_IT_TITLE)
    await overlayPage.selectDuration(/1 minute/i)
    await overlayPage.clickSetReminder()
    await overlayPage.expectSuccessMessage()

    // Wait for tab to close or overlay to disappear
    try {
      await page.waitForTimeout(5000)
      if (!page.isClosed()) {
        await page.close()
      }
    } catch {
      console.log("[Test] Tab was closed as expected")
    }

    // Open the popup
    const popupPageObj = new PopupPage(
      await extensionContext.newPage(),
      extensionId
    )
    await popupPageObj.goto()

    // Verify "Sleeping on it" section
    await popupPageObj.expectSavingsTotal()
    await popupPageObj.expectEncouragingMessage()
    await popupPageObj.expectReminderText()

    if (productInfo.name) {
      await popupPageObj.expectProductInSleeping(productInfo.name)
    }

    console.log(
      "[Test] Successfully verified product in popup with all required information"
    )

    // Wait for the 1 minute reminder to expire
    console.log("[Test] Waiting for 1 minute reminder to expire...")
    await popupPageObj.page.waitForTimeout(TEST_CONFIG.TIMEOUTS.REMINDER_1MIN)

    // Refresh the popup to see updated state
    await popupPageObj.reload()

    // Verify the product is NO LONGER in "Sleeping on it" section
    if (productInfo.name) {
      await popupPageObj.expectProductNotInSleeping(productInfo.name)
    }

    // Verify "Achievements" section
    await popupPageObj.expectSavedAmount()

    if (productInfo.name) {
      await popupPageObj.expectProductInAchievements(productInfo.name)
    }

    console.log(
      "[Test] Successfully verified product moved to Achievements after reminder expired"
    )
  })

  test('should handle "I changed my mind" button click', async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to the test product page
    await navigateToProduct(page, TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY)

    // Extract product information
    const productInfo = await extractProductInfo(page)
    console.log(`[Test] Product Name: ${productInfo.name}`)
    console.log(`[Test] Product Price: ${productInfo.price}`)

    // Create overlay page object and complete sleep on it flow
    const overlayPage = new OverlayPage(page, extensionId)
    await overlayPage.expectAttached()
    await overlayPage.clickSleepOnIt()
    await overlayPage.expectTextVisible(TEST_CONFIG.TEXT.SLEEP_ON_IT_TITLE)
    await overlayPage.selectDuration(/24 hours/i)
    await overlayPage.clickSetReminder()
    await overlayPage.expectSuccessMessage()

    // Wait for tab to close or overlay to disappear
    try {
      await page.waitForTimeout(5000)
      if (!page.isClosed()) {
        await page.close()
      }
    } catch {
      console.log("[Test] Tab was closed as expected")
    }

    // Open the popup
    const popupPageObj = new PopupPage(
      await extensionContext.newPage(),
      extensionId
    )
    await popupPageObj.goto()

    // Verify the product is in the sleeping section
    if (productInfo.name) {
      await popupPageObj.expectProductInSleeping(productInfo.name)
    }

    // Set up listener for new page and click "I changed my mind"
    const newPagePromise = extensionContext.waitForEvent("page")
    await popupPageObj.clickChangedMyMind()

    // Wait for the product page to open
    const productPage = await newPagePromise
    await productPage.waitForLoadState("load")

    // Verify we're on the correct product page
    expect(productPage.url()).toContain(TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY)
    console.log("[Test] Product page opened successfully")

    // Reload the popup to see updated state
    await popupPageObj.reload()

    // Verify the product is NO LONGER in "Sleeping on it" section
    if (productInfo.name) {
      await popupPageObj.expectProductNotInSleeping(productInfo.name)
    }

    console.log(
      '[Test] Successfully verified "I changed my mind" flow - product removed from sleeping section'
    )

    // Clean up
    await productPage.close()
  })

  test("should show 'You're back!' view when returning to product page before reminder expires", async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    const productUrl = `${TEST_CONFIG.BASE_URL}/dp/${TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY}`

    // Navigate to the test product page
    await page.goto(productUrl, { waitUntil: "load" })

    // Create overlay page object and complete sleep on it flow
    const overlayPage = new OverlayPage(page, extensionId)
    await overlayPage.expectAttached()
    await overlayPage.clickSleepOnIt()
    await overlayPage.selectDuration(/3 days/i)
    await overlayPage.clickSetReminder()
    await overlayPage.expectSuccessMessage()

    // Wait for tab to close
    try {
      await page.waitForTimeout(6000)
      if (!page.isClosed()) {
        await page.close()
      }
    } catch {
      // Expected: page.waitForTimeout throws when tab is closed
    }

    // Go back to the same product url
    const newPage = await extensionContext.newPage()
    await newPage.goto(productUrl, { waitUntil: "load" })

    // Create overlay page object for the new page
    const newOverlayPage = new OverlayPage(newPage, extensionId)

    await newOverlayPage.expectAttached()

    await newOverlayPage.expectTextVisible(
      TEST_CONFIG.TEXT.DECISION_PROMPT,
      5000
    )

    // Verify buttons are present
    await expect(newOverlayPage.getButton(/I need this now/i)).toBeVisible()
    await expect(newOverlayPage.getButton(/I'll wait/i)).toBeVisible()
    await expect(newOverlayPage.getButton(/I don't need/i)).toBeVisible()

    await newPage.close()
  })
})
