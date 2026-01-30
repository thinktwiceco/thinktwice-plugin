import { expect, test } from "./fixtures"
import { OverlayPage } from "./page-objects/OverlayPage"
import { PopupPage } from "./page-objects/PopupPage"
import { PRIMARY_PRODUCT_ID, TEST_CONFIG } from "./test-config"
import { navigateToProduct } from "./utils/extension-helpers"
import { extractProductInfo } from "./utils/product-helpers"

test.describe('ThinkTwice "Sleep on it" Flow', () => {
  test("should show celebration and close tab after setting 1 minute reminder (bug test)", async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()
    const productId = PRIMARY_PRODUCT_ID

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to the test product page
    await navigateToProduct(page, productId)

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
    const productId = PRIMARY_PRODUCT_ID

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to the test product page
    await navigateToProduct(page, productId)

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
    const productId = PRIMARY_PRODUCT_ID

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to the test product page
    await navigateToProduct(page, productId)

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
    expect(productPage.url()).toContain(productId)
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

    // Navigate to the test product page
    await navigateToProduct(page, PRIMARY_PRODUCT_ID)

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
    await navigateToProduct(newPage, PRIMARY_PRODUCT_ID)

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

  test("should show BackToAnOldFlame view when returning after timer expires", async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    test.setTimeout(120000) // 2 minutes

    const page = await extensionContext.newPage()
    const productId = PRIMARY_PRODUCT_ID

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to the test product page
    await navigateToProduct(page, productId)

    // Create overlay page object and complete sleep on it flow with 1 minute timer
    const overlayPage = new OverlayPage(page, extensionId)
    await overlayPage.expectAttached()
    await overlayPage.clickSleepOnIt()
    await overlayPage.selectDuration(/1 minute/i)
    await overlayPage.clickSetReminder()
    await overlayPage.expectSuccessMessage()

    // Wait for tab to close
    try {
      await page.waitForTimeout(6000)
      if (!page.isClosed()) {
        await page.close()
      }
    } catch {
      // Expected: page closed
    }

    // Wait for timer to expire
    console.log("[Test] Waiting for 1 minute timer to expire...")
    await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.REMINDER_1MIN)

    // Go back to the same product url AFTER timer expired
    const newPage = await extensionContext.newPage()
    await navigateToProduct(newPage, productId)

    // Create overlay page object for the new page
    const newOverlayPage = new OverlayPage(newPage, extensionId)
    await newOverlayPage.expectAttached()

    // Verify BackToAnOldFlame view is shown
    await newOverlayPage.expectTextVisible("You're back!", 5000)
    await newOverlayPage.expectTextVisible("thoughtful", 5000)

    // Verify buttons are present
    await expect(newOverlayPage.getButton(/Yes, I want it/i)).toBeVisible()
    await expect(newOverlayPage.getButton(/I don't need it/i)).toBeVisible()
    await expect(newOverlayPage.getButton(/I'm still not sure/i)).toBeVisible()

    await newPage.close()
  })

  test('should delete reminder when clicking "I need this now" during early return', async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()
    const productId = PRIMARY_PRODUCT_ID

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to the test product page
    await navigateToProduct(page, productId)

    // Extract product information
    const productInfo = await extractProductInfo(page)

    // Create overlay page object and complete sleep on it flow
    const overlayPage = new OverlayPage(page, extensionId)
    await overlayPage.expectAttached()
    await overlayPage.clickSleepOnIt()
    await overlayPage.selectDuration(/24 hours/i)
    await overlayPage.clickSetReminder()
    await overlayPage.expectSuccessMessage()

    // Wait for tab to close
    try {
      await page.waitForTimeout(6000)
      if (!page.isClosed()) {
        await page.close()
      }
    } catch {
      // Expected: page closed
    }

    // Open popup and verify product is in "Sleeping on it" section
    const popupPageObj = new PopupPage(
      await extensionContext.newPage(),
      extensionId
    )
    await popupPageObj.goto()
    if (productInfo.name) {
      await popupPageObj.expectProductInSleeping(productInfo.name)
    }
    await popupPageObj.page.close()

    // Go back to the same product url BEFORE timer expires
    const newPage = await extensionContext.newPage()
    await navigateToProduct(newPage, productId)

    // Create overlay page object for the new page
    const newOverlayPage = new OverlayPage(newPage, extensionId)
    await newOverlayPage.expectAttached()

    // Verify EarlyReturnFromSleep view is shown
    await newOverlayPage.expectTextVisible("You're back!", 5000)

    // Click "I need this now" button
    await newOverlayPage.clickButton(/I need this now/i)

    // Verify celebration is shown
    await newOverlayPage.expectCelebrationVisible(
      TEST_CONFIG.TEXT.CELEBRATION_NEED_IT
    )

    // Wait for overlay to hide
    await newOverlayPage.expectHidden(TEST_CONFIG.TIMEOUTS.CELEBRATION_FADE)

    // Open popup again and verify product is NOT in "Sleeping on it" section
    const popupPageObj2 = new PopupPage(
      await extensionContext.newPage(),
      extensionId
    )
    await popupPageObj2.goto()
    if (productInfo.name) {
      await popupPageObj2.expectProductNotInSleeping(productInfo.name)
    }

    console.log(
      '[Test] Successfully verified reminder deletion after "I need this now"'
    )
  })

  test('should delete reminder when clicking "Yes, I want it" after timer expires', async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    test.setTimeout(120000) // 2 minutes

    const page = await extensionContext.newPage()
    const productId = PRIMARY_PRODUCT_ID

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to the test product page
    await navigateToProduct(page, productId)

    // Extract product information
    const productInfo = await extractProductInfo(page)

    // Create overlay page object and complete sleep on it flow with 1 minute timer
    const overlayPage = new OverlayPage(page, extensionId)
    await overlayPage.expectAttached()
    await overlayPage.clickSleepOnIt()
    await overlayPage.selectDuration(/1 minute/i)
    await overlayPage.clickSetReminder()
    await overlayPage.expectSuccessMessage()

    // Wait for tab to close
    try {
      await page.waitForTimeout(6000)
      if (!page.isClosed()) {
        await page.close()
      }
    } catch {
      // Expected: page closed
    }

    // Wait for timer to expire
    console.log("[Test] Waiting for 1 minute timer to expire...")
    await page.waitForTimeout(TEST_CONFIG.TIMEOUTS.REMINDER_1MIN)

    // Open popup and verify product is still in "Sleeping on it" section
    const popupPageObj = new PopupPage(
      await extensionContext.newPage(),
      extensionId
    )
    await popupPageObj.goto()
    if (productInfo.name) {
      await popupPageObj.expectProductInSleeping(productInfo.name)
    }
    await popupPageObj.page.close()

    // Go back to the same product url AFTER timer expired
    const newPage = await extensionContext.newPage()
    await navigateToProduct(newPage, productId)

    // Create overlay page object for the new page
    const newOverlayPage = new OverlayPage(newPage, extensionId)
    await newOverlayPage.expectAttached()

    // Verify BackToAnOldFlame view is shown
    await newOverlayPage.expectTextVisible("You're back!", 5000)

    // Click "Yes, I want it" button
    await newOverlayPage.clickButton(/Yes, I want it/i)

    // Verify celebration is shown
    await newOverlayPage.expectCelebrationVisible(
      TEST_CONFIG.TEXT.CELEBRATION_NEED_IT
    )

    // Wait for overlay to hide
    await newOverlayPage.expectHidden(TEST_CONFIG.TIMEOUTS.CELEBRATION_FADE)

    // Open popup again and verify product is NOT in "Sleeping on it" section
    const popupPageObj2 = new PopupPage(
      await extensionContext.newPage(),
      extensionId
    )
    await popupPageObj2.goto()
    if (productInfo.name) {
      await popupPageObj2.expectProductNotInSleeping(productInfo.name)
    }

    console.log(
      '[Test] Successfully verified reminder deletion after "Yes, I want it"'
    )
  })

  test("should show EarlyReturnFromSleep on multiple early returns", async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    const page = await extensionContext.newPage()
    const productId = PRIMARY_PRODUCT_ID

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to the test product page
    await navigateToProduct(page, productId)

    // Create overlay page object and complete sleep on it flow
    const overlayPage = new OverlayPage(page, extensionId)
    await overlayPage.expectAttached()
    await overlayPage.clickSleepOnIt()
    await overlayPage.selectDuration(/24 hours/i)
    await overlayPage.clickSetReminder()
    await overlayPage.expectSuccessMessage()

    // Wait for tab to close
    try {
      await page.waitForTimeout(6000)
      if (!page.isClosed()) {
        await page.close()
      }
    } catch {
      // Expected: page closed
    }

    // First early return
    const newPage1 = await extensionContext.newPage()
    await navigateToProduct(newPage1, productId)
    const newOverlayPage1 = new OverlayPage(newPage1, extensionId)
    await newOverlayPage1.expectAttached()
    await newOverlayPage1.expectTextVisible("You're back!", 5000)
    await expect(newOverlayPage1.getButton(/I need this now/i)).toBeVisible()

    // Click "I'll wait"
    await newOverlayPage1.clickButton(/I'll wait/i)
    await newOverlayPage1.expectHidden(5000)
    await newPage1.close()

    // Second early return - should still show EarlyReturnFromSleep
    const newPage2 = await extensionContext.newPage()
    await navigateToProduct(newPage2, productId)
    const newOverlayPage2 = new OverlayPage(newPage2, extensionId)
    await newOverlayPage2.expectAttached()
    await newOverlayPage2.expectTextVisible("You're back!", 5000)
    await expect(newOverlayPage2.getButton(/I need this now/i)).toBeVisible()

    console.log(
      "[Test] Successfully verified multiple early returns show EarlyReturnFromSleep"
    )

    await newPage2.close()
  })

  test("should show BackToAnOldFlame at exact expiration time", async ({
    extensionContext,
    extensionId,
    extensionHelper
  }) => {
    test.setTimeout(120000) // 2 minutes

    const page = await extensionContext.newPage()
    const productId = PRIMARY_PRODUCT_ID

    // Clear storage to ensure clean state
    await extensionHelper.clearStorage()

    // Navigate to the test product page
    await navigateToProduct(page, productId)

    // Record start time
    const startTime = Date.now()

    // Create overlay page object and complete sleep on it flow with 1 minute timer
    const overlayPage = new OverlayPage(page, extensionId)
    await overlayPage.expectAttached()
    await overlayPage.clickSleepOnIt()
    await overlayPage.selectDuration(/1 minute/i)
    await overlayPage.clickSetReminder()
    await overlayPage.expectSuccessMessage()

    // Wait for tab to close
    try {
      await page.waitForTimeout(6000)
      if (!page.isClosed()) {
        await page.close()
      }
    } catch {
      // Expected: page closed
    }

    // Wait until exactly 1 minute has passed
    const elapsedTime = Date.now() - startTime
    const remainingTime = TEST_CONFIG.TIMEOUTS.REMINDER_1MIN - elapsedTime
    if (remainingTime > 0) {
      await page.waitForTimeout(remainingTime)
    }

    // Go back to the same product url at expiration time
    const newPage = await extensionContext.newPage()
    await navigateToProduct(newPage, productId)

    // Create overlay page object for the new page
    const newOverlayPage = new OverlayPage(newPage, extensionId)
    await newOverlayPage.expectAttached()

    // Verify BackToAnOldFlame view is shown (not EarlyReturnFromSleep)
    await newOverlayPage.expectTextVisible("You're back!", 5000)
    await newOverlayPage.expectTextVisible("thoughtful", 5000)

    // Verify buttons are for BackToAnOldFlame
    await expect(newOverlayPage.getButton(/Yes, I want it/i)).toBeVisible()
    await expect(newOverlayPage.getButton(/I'm still not sure/i)).toBeVisible()

    console.log(
      "[Test] Successfully verified BackToAnOldFlame at exact expiration time"
    )

    await newPage.close()
  })
})
