import path from "path"
import { chromium, expect, test, type BrowserContext } from "@playwright/test"

import { TEST_CONFIG } from "./test-config"

const EXTENSION_PATH = path.resolve(__dirname, "../../build/chrome-mv3-dev")

test.describe('ThinkTwice "Sleep on it" Flow', () => {
  let context: BrowserContext
  let userDataDir: string

  test.beforeEach(async () => {
    userDataDir = path.join(
      __dirname,
      "../../tmp/test-user-data-" + Math.random().toString(36).substring(7)
    )
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: process.env.CI ? false : process.env.HEADLESS === "true",
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`
      ]
    })
  })

  test.afterEach(async () => {
    await context.close()
  })

  test("should show celebration and close tab after setting 1 minute reminder (bug test)", async () => {
    const page = await context.newPage()

    // 1. Find extension ID
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent("serviceworker")
    }
    const extensionId = worker.url().split("/")[2]

    // 2. Clear storage to ensure clean state
    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)
    await popupPage.evaluate(() => chrome.storage.local.clear())
    await popupPage.close()

    // 3. Navigate to the test product page
    await page.goto(
      `https://www.amazon.com/dp/${TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY}`,
      {
        waitUntil: "load"
      }
    )

    // 4. Wait for the overlay to be attached
    const overlayHost = page
      .locator(
        'plasmo-csui, plasmo-cs-ui, plasmo-cs-overlay, [id^="plasmo-csui"]'
      )
      .first()
    await expect(overlayHost).toBeAttached({ timeout: 20000 })

    // 5. Click "Sleep on it"
    const sleepOnItButton = overlayHost
      .getByRole("button", { name: /Sleep on it/i })
      .first()
    await expect(sleepOnItButton).toBeVisible({ timeout: 10000 })
    await sleepOnItButton.click()

    // 6. Verify we're in the Sleep on it view
    const sleepOnItTitle = overlayHost
      .locator('text="Brilliant choice!"')
      .first()
    await expect(sleepOnItTitle).toBeVisible({ timeout: 10000 })

    // 7. Select "1 minute" duration
    const oneMinuteButton = overlayHost
      .getByRole("button", { name: /1 minute/i })
      .first()
    await expect(oneMinuteButton).toBeVisible({ timeout: 5000 })
    await oneMinuteButton.click()

    // 8. Click "Set Reminder"
    const setReminderButton = overlayHost
      .getByRole("button", { name: /Set Reminder/i })
      .first()
    await expect(setReminderButton).toBeVisible({ timeout: 5000 })
    await setReminderButton.click()

    // 9. Verify success message appears
    const successMessage = overlayHost
      .locator(
        'text="✓ Reminder saved! Hold tight and remember about the goal!"'
      )
      .first()
    await expect(successMessage).toBeVisible({ timeout: 10000 })

    // 10. BUG TEST: Verify we DON'T see the early return view
    // Expected: Success message stays visible, then tab closes
    // Bug: Early return view appears with "You're back! You waited for 0 seconds"

    // Wait a bit to see if the bug occurs (early return view appearing)
    await page.waitForTimeout(1000)

    // Check that we're NOT seeing the early return view
    const earlyReturnText = overlayHost.locator('text="You\'re back!"')
    await expect(earlyReturnText).not.toBeVisible({ timeout: 1000 })

    // Check that we're NOT seeing "You waited for 0 seconds"
    const zeroSecondsText = overlayHost.locator(
      "text=/You waited for 0 seconds/i"
    )
    await expect(zeroSecondsText).not.toBeVisible({ timeout: 1000 })

    // 11. Verify the success message is still visible (not replaced by early return)
    await expect(successMessage).toBeVisible({ timeout: 2000 })

    // 12. Expected behavior: Tab should close after 4 seconds
    // The tab closure will cause the page to be closed, so we need to handle that
    try {
      await page.waitForTimeout(5000)
      // If we get here, tab didn't close - verify overlay is at least gone
      await expect(overlayHost).not.toBeVisible({ timeout: 2000 })
    } catch {
      // Expected: page.waitForTimeout throws when tab is closed
      // Verify the page is actually closed
      expect(page.isClosed()).toBe(true)
      console.log("[Test] Tab was closed as expected")
    }
  })

  test("should display product in popup after setting 1 minute reminder", async () => {
    // Set a longer timeout for this test since we need to wait for the 1 minute reminder
    test.setTimeout(120000) // 2 minutes

    const page = await context.newPage()

    // 1. Find extension ID
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent("serviceworker")
    }
    const extensionId = worker.url().split("/")[2]

    // 2. Clear storage to ensure clean state
    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)
    await popupPage.evaluate(() => chrome.storage.local.clear())
    await popupPage.close()

    // 3. Navigate to the test product page
    await page.goto(
      `https://www.amazon.com/dp/${TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY}`,
      {
        waitUntil: "load"
      }
    )

    // 4. Wait for the overlay to be attached
    const overlayHost = page
      .locator(
        'plasmo-csui, plasmo-cs-ui, plasmo-cs-overlay, [id^="plasmo-csui"]'
      )
      .first()
    await expect(overlayHost).toBeAttached({ timeout: 20000 })

    // 5. Extract product information from the page before interacting
    const productName = await page
      .locator("#productTitle")
      .first()
      .textContent()
    const productPriceElement = await page
      .locator(".a-price .a-offscreen")
      .first()
      .textContent()

    console.log(`[Test] Product Name: ${productName}`)
    console.log(`[Test] Product Price: ${productPriceElement}`)

    // 6. Click "Sleep on it"
    const sleepOnItButton = overlayHost
      .getByRole("button", { name: /Sleep on it/i })
      .first()
    await expect(sleepOnItButton).toBeVisible({ timeout: 10000 })
    await sleepOnItButton.click()

    // 7. Verify we're in the Sleep on it view
    const sleepOnItTitle = overlayHost
      .locator('text="Brilliant choice!"')
      .first()
    await expect(sleepOnItTitle).toBeVisible({ timeout: 10000 })

    // 8. Select "1 minute" duration
    const oneMinuteButton = overlayHost
      .getByRole("button", { name: /1 minute/i })
      .first()
    await expect(oneMinuteButton).toBeVisible({ timeout: 5000 })
    await oneMinuteButton.click()

    // 9. Click "Set Reminder"
    const setReminderButton = overlayHost
      .getByRole("button", { name: /Set Reminder/i })
      .first()
    await expect(setReminderButton).toBeVisible({ timeout: 5000 })
    await setReminderButton.click()

    // 10. Wait for success message
    const successMessage = overlayHost
      .locator(
        'text="✓ Reminder saved! Hold tight and remember about the goal!"'
      )
      .first()
    await expect(successMessage).toBeVisible({ timeout: 10000 })

    // 11. Wait for tab to close or overlay to disappear
    // The tab should auto-close after 4 seconds
    try {
      await page.waitForTimeout(5000)
      // If we get here, tab didn't close - close it manually
      if (!page.isClosed()) {
        await page.close()
      }
    } catch {
      // Expected: page.waitForTimeout throws when tab is closed
      console.log("[Test] Tab was closed as expected")
    }

    // 13. Open the popup by navigating to popup.html
    // Note: chrome.action.openPopup() doesn't work reliably in test environment
    const popup = await context.newPage()
    await popup.goto(`chrome-extension://${extensionId}/popup.html`)
    await popup.waitForLoadState("load")

    // 14. Verify "Sleeping on it" section is present
    const sleepingOnItSection = popup.locator('h3:has-text("Sleeping on it")')
    await expect(sleepingOnItSection).toBeVisible({ timeout: 10000 })

    // 15. Verify the total savings is displayed
    const savingsText = popup.locator("text=/Saving: \\$/i")
    await expect(savingsText).toBeVisible({ timeout: 5000 })

    // 16. Verify the encouraging message
    const encouragingMessage = popup.locator('text="You can do this! 💪"')
    await expect(encouragingMessage).toBeVisible({ timeout: 5000 })

    // 17. Verify product name is present
    if (productName) {
      const trimmedName = productName.trim()
      const productNameInPopup = popup.locator(`text="${trimmedName}"`)
      await expect(productNameInPopup).toBeVisible({ timeout: 5000 })
    }

    // 18. Verify product price is present (in popup format: "Price: $X.XX")
    if (productPriceElement) {
      const priceInPopup = popup.locator(
        `text=/Price:.*${productPriceElement.replace("$", "\\$")}/i`
      )
      await expect(priceInPopup).toBeVisible({ timeout: 5000 })
    }

    // 19. Verify reminder time is present (should say "in 1 minute" or similar)
    const reminderText = popup.locator("text=/Reminder: in/i")
    await expect(reminderText).toBeVisible({ timeout: 5000 })

    console.log(
      "[Test] Successfully verified product in popup with all required information"
    )

    // 20. Wait for the 1 minute reminder to expire
    // Adding a bit of buffer time to ensure the alarm fires
    console.log("[Test] Waiting for 1 minute reminder to expire...")
    await popup.waitForTimeout(65000) // 65 seconds to account for processing time

    // 21. Refresh the popup to see updated state
    await popup.reload()
    await popup.waitForLoadState("load")

    // 22. Verify the product is NO LONGER in "Sleeping on it" section
    const sleepingOnItSectionAfter = popup.locator(
      'h3:has-text("Sleeping on it")'
    )
    // The section should either not exist or not be visible if there are no more sleeping items
    const sleepingItemsExist = await sleepingOnItSectionAfter.count()
    if (sleepingItemsExist > 0) {
      // If section exists, the specific product should not be there
      const productInSleeping = popup.locator(".reminder-card", {
        hasText: productName?.trim() || ""
      })
      await expect(productInSleeping).not.toBeVisible({ timeout: 5000 })
    }

    // 23. Verify "Achievements - You resisted!" section is present
    const achievementsSection = popup.locator(
      'h3:has-text("Achievements - You resisted! 🎉")'
    )
    await expect(achievementsSection).toBeVisible({ timeout: 10000 })

    // 24. Verify the saved amount is displayed
    const savedText = popup.locator("text=/Saved: \\$/i")
    await expect(savedText).toBeVisible({ timeout: 5000 })

    // 25. Verify product name is in achievements
    if (productName) {
      const trimmedName = productName.trim()
      const productNameInAchievements = popup
        .locator(`text="${trimmedName}"`)
        .last()
      await expect(productNameInAchievements).toBeVisible({ timeout: 5000 })
    }

    // 26. Verify product price is in achievements
    if (productPriceElement) {
      const priceInAchievements = popup
        .locator(`text=/Price:.*${productPriceElement.replace("$", "\\$")}/i`)
        .last()
      await expect(priceInAchievements).toBeVisible({ timeout: 5000 })
    }

    console.log(
      "[Test] Successfully verified product moved to Achievements after reminder expired"
    )
  })

  test('should handle "I changed my mind" button click', async () => {
    const page = await context.newPage()

    // 1. Find extension ID
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent("serviceworker")
    }
    const extensionId = worker.url().split("/")[2]

    // 2. Clear storage to ensure clean state
    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)
    await popupPage.evaluate(() => chrome.storage.local.clear())
    await popupPage.close()

    // 3. Navigate to the test product page
    await page.goto(
      `https://www.amazon.com/dp/${TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY}`,
      {
        waitUntil: "load"
      }
    )

    // 4. Wait for the overlay to be attached
    const overlayHost = page
      .locator(
        'plasmo-csui, plasmo-cs-ui, plasmo-cs-overlay, [id^="plasmo-csui"]'
      )
      .first()
    await expect(overlayHost).toBeAttached({ timeout: 20000 })

    // 5. Extract product information
    const productName = await page
      .locator("#productTitle")
      .first()
      .textContent()
    const productPriceElement = await page
      .locator(".a-price .a-offscreen")
      .first()
      .textContent()

    console.log(`[Test] Product Name: ${productName}`)
    console.log(`[Test] Product Price: ${productPriceElement}`)

    // 6. Click "Sleep on it"
    const sleepOnItButton = overlayHost
      .getByRole("button", { name: /Sleep on it/i })
      .first()
    await expect(sleepOnItButton).toBeVisible({ timeout: 10000 })
    await sleepOnItButton.click()

    // 7. Verify we're in the Sleep on it view
    const sleepOnItTitle = overlayHost
      .locator('text="Brilliant choice!"')
      .first()
    await expect(sleepOnItTitle).toBeVisible({ timeout: 10000 })

    // 8. Select "24 hours" duration
    const oneDayButton = overlayHost
      .getByRole("button", { name: /24 hours/i })
      .first()
    await expect(oneDayButton).toBeVisible({ timeout: 5000 })
    await oneDayButton.click()

    // 9. Click "Set Reminder"
    const setReminderButton = overlayHost
      .getByRole("button", { name: /Set Reminder/i })
      .first()
    await expect(setReminderButton).toBeVisible({ timeout: 5000 })
    await setReminderButton.click()

    // 10. Wait for success message
    const successMessage = overlayHost
      .locator(
        'text="✓ Reminder saved! Hold tight and remember about the goal!"'
      )
      .first()
    await expect(successMessage).toBeVisible({ timeout: 10000 })

    // 11. Wait for tab to close or overlay to disappear
    try {
      await page.waitForTimeout(5000)
      if (!page.isClosed()) {
        await page.close()
      }
    } catch {
      console.log("[Test] Tab was closed as expected")
    }

    // 12. Open the popup
    const popup = await context.newPage()
    await popup.goto(`chrome-extension://${extensionId}/popup.html`)
    await popup.waitForLoadState("load")

    // 13. Verify "Sleeping on it" section is present
    const sleepingOnItSection = popup.locator('h3:has-text("Sleeping on it")')
    await expect(sleepingOnItSection).toBeVisible({ timeout: 10000 })

    // 14. Verify the product is in the sleeping section
    if (productName) {
      const trimmedName = productName.trim()
      const productNameInPopup = popup.locator(`text="${trimmedName}"`)
      await expect(productNameInPopup).toBeVisible({ timeout: 5000 })
    }

    // 15. Click "I changed my mind" button
    const changedMindButton = popup.getByRole("button", {
      name: /I changed my mind/i
    })
    await expect(changedMindButton).toBeVisible({ timeout: 5000 })

    // 16. Set up listener for new page (product page should open)
    const newPagePromise = context.waitForEvent("page")
    await changedMindButton.click()

    // 17. Wait for the product page to open
    const productPage = await newPagePromise
    await productPage.waitForLoadState("load")

    // 18. Verify we're on the correct product page
    expect(productPage.url()).toContain(TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY)
    console.log("[Test] Product page opened successfully")

    // 19. Reload the popup to see updated state
    await popup.reload()
    await popup.waitForLoadState("load")

    // 20. Verify the product is NO LONGER in "Sleeping on it" section
    const sleepingOnItSectionAfter = popup.locator(
      'h3:has-text("Sleeping on it")'
    )
    const sleepingItemsExist = await sleepingOnItSectionAfter.count()

    if (sleepingItemsExist > 0 && productName) {
      // If section still exists, verify the specific product is not there
      const trimmedName = productName.trim()
      const productInSleeping = popup.locator(`text="${trimmedName}"`)
      await expect(productInSleeping).not.toBeVisible({ timeout: 5000 })
    } else {
      // Section should not exist if there are no sleeping items
      await expect(sleepingOnItSectionAfter).not.toBeVisible({ timeout: 5000 })
    }

    console.log(
      '[Test] Successfully verified "I changed my mind" flow - product removed from sleeping section'
    )

    // Clean up
    await productPage.close()
  })

  test("should show 'You're back!' view when returning to product page before reminder expires", async () => {
    const page = await context.newPage()

    // 1. Find extension ID
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent("serviceworker")
    }
    const extensionId = worker.url().split("/")[2]

    // 2. Clear storage to ensure clean state
    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)
    await popupPage.evaluate(() => chrome.storage.local.clear())
    await popupPage.close()

    const productUrl = `https://www.amazon.com/dp/${TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY}`

    // 3. Navigate to the test product page
    await page.goto(productUrl, {
      waitUntil: "load"
    })

    // 4. Wait for the overlay to be attached
    const overlayHost = page
      .locator(
        'plasmo-csui, plasmo-cs-ui, plasmo-cs-overlay, [id^="plasmo-csui"]'
      )
      .first()
    await expect(overlayHost).toBeAttached({ timeout: 20000 })

    // 5. Click "Sleep on it"
    const sleepOnItButton = overlayHost
      .getByRole("button", { name: /Sleep on it/i })
      .first()
    await expect(sleepOnItButton).toBeVisible({ timeout: 10000 })
    await sleepOnItButton.click()

    // 6. Select "3 days" duration
    const threeDaysButton = overlayHost
      .getByRole("button", { name: /3 days/i })
      .first()
    await expect(threeDaysButton).toBeVisible({ timeout: 5000 })
    await threeDaysButton.click()

    // 7. Click "Set Reminder"
    const setReminderButton = overlayHost
      .getByRole("button", { name: /Set Reminder/i })
      .first()
    await expect(setReminderButton).toBeVisible({ timeout: 5000 })
    await setReminderButton.click()

    // 8. Wait for success message
    const successMessage = overlayHost
      .locator(
        'text="✓ Reminder saved! Hold tight and remember about the goal!"'
      )
      .first()
    await expect(successMessage).toBeVisible({ timeout: 10000 })

    // 9. Wait for tab to close
    try {
      await page.waitForTimeout(6000) // Wait longer than the 4s delay
      if (!page.isClosed()) {
        await page.close()
      }
    } catch {
      // Expected: page.waitForTimeout throws when tab is closed
    }

    // 10. Go back to the same product url
    const newPage = await context.newPage()
    await newPage.goto(productUrl, {
      waitUntil: "load"
    })

    // 11. Wait for overlay on the new page
    const newOverlayHost = newPage
      .locator(
        'plasmo-csui, plasmo-cs-ui, plasmo-cs-overlay, [id^="plasmo-csui"]'
      )
      .first()
    await expect(newOverlayHost).toBeAttached({ timeout: 20000 })

    // 12. Verify "You're back!" view is open
    // We look for text that matches "You're back! You waited for"
    const welcomeBackText = newOverlayHost.locator(
      "text=/You're back! You waited for/i"
    )
    await expect(welcomeBackText).toBeVisible({ timeout: 10000 })

    const decisionText = newOverlayHost.locator(
      'text="Have you made a decision?"'
    )
    await expect(decisionText).toBeVisible({ timeout: 5000 })

    // 13. Verify buttons are present
    const iNeedThisButton = newOverlayHost.getByRole("button", {
      name: /I need this now/i
    })
    await expect(iNeedThisButton).toBeVisible()

    const illWaitButton = newOverlayHost.getByRole("button", {
      name: /I'll wait/i
    }) // Note: Button text might have apostrophe escaped or not, regex handles case verify
    await expect(illWaitButton).toBeVisible()

    const dontNeedButton = newOverlayHost.getByRole("button", {
      name: /I don't need/i
    })
    await expect(dontNeedButton).toBeVisible()

    await newPage.close()
  })
})
