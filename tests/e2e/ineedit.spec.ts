import path from "path"
import { chromium, expect, test, type BrowserContext } from "@playwright/test"

import { TEST_CONFIG } from "./test-config"

const EXTENSION_PATH = path.resolve(__dirname, "../../build/chrome-mv3-dev")

test.describe('ThinkTwice "I need it" Flow', () => {
  let context: BrowserContext
  let userDataDir: string

  test.beforeEach(async () => {
    userDataDir = path.join(
      __dirname,
      "../../tmp/test-user-data-" + Math.random().toString(36).substring(7)
    )
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: !!process.env.CI || process.env.HEADLESS === "true",
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
    })
  })

  test.afterEach(async () => {
    await context.close()
  })

  test('should complete the "I need it" flow and prevent overlay from reappearing', async () => {
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

    // 3. Navigate to a known valid Amazon product page
    const productUrl = `https://www.amazon.com/dp/${TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY}`
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

    // 5. Click "I need it"
    const needItButton = overlayHost
      .getByRole("button", { name: /I need it/i })
      .first()
    await expect(needItButton).toBeVisible({ timeout: 10000 })
    await needItButton.click()

    // 6. Verify Celebration View
    const celebrationText = overlayHost
      .locator('text="Trusting your decision is powerful! 🎉"')
      .first()
    await expect(celebrationText).toBeVisible({ timeout: 10000 })

    // 7. Wait 4 seconds for the auto-close delay
    await page.waitForTimeout(4000)

    // 8. Verify that the celebration closes (text should not be visible)
    await expect(celebrationText).not.toBeVisible({ timeout: 2000 })

    // 9. Verify that no overlay is visible
    await expect(overlayHost).not.toBeVisible({ timeout: 2000 })

    // 10. Verify product state is saved to storage
    const expectedProductId = `amazon-${TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY}`
    const storagePage = await context.newPage()
    await storagePage.goto(`chrome-extension://${extensionId}/popup.html`)
    const storageData = (await storagePage.evaluate(() => {
      return new Promise<Record<string, { state?: string }>>((resolve) => {
        chrome.storage.local.get("thinktwice_products", (result) => {
          resolve(
            (result.thinktwice_products as Record<
              string,
              { state?: string }
            >) || {}
          )
        })
      })
    })) as Record<string, { state?: string }>
    await storagePage.close()

    expect(storageData).toBeDefined()
    expect(storageData[expectedProductId]).toBeDefined()
    expect(storageData[expectedProductId].state).toBe("iNeedThis")

    // 11. Close the tab
    await page.close()

    // 12. Navigate to the same product URL again
    const newPage = await context.newPage()
    await newPage.goto(productUrl, {
      waitUntil: "load"
    })

    // 13. Wait a bit for the extension to check the product state
    await newPage.waitForTimeout(2000)

    // 14. Verify overlay does NOT appear (product state should prevent it)
    // The overlay element might be attached but hidden when state is I_NEED_THIS
    const overlayHostAfterReturn = newPage
      .locator(
        'plasmo-csui, plasmo-cs-ui, plasmo-cs-overlay, [id^="plasmo-csui"]'
      )
      .first()
    // Check if overlay is not visible (it might be attached but hidden/empty)
    await expect(overlayHostAfterReturn).not.toBeVisible({ timeout: 5000 })
  })

  test('should show overlay for different product after clicking "I need it" on first product', async () => {
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

    // 3. Navigate to first product (PRIMARY)
    const firstProductUrl = `https://www.amazon.com/dp/${TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY}`
    await page.goto(firstProductUrl, {
      waitUntil: "load"
    })

    // 4. Wait for the overlay to be attached
    const overlayHost = page
      .locator(
        'plasmo-csui, plasmo-cs-ui, plasmo-cs-overlay, [id^="plasmo-csui"]'
      )
      .first()
    await expect(overlayHost).toBeAttached({ timeout: 20000 })

    // 5. Click "I need it"
    const needItButton = overlayHost
      .getByRole("button", { name: /I need it/i })
      .first()
    await expect(needItButton).toBeVisible({ timeout: 10000 })
    await needItButton.click()

    // 6. Verify Celebration View
    const celebrationText = overlayHost
      .locator('text="Trusting your decision is powerful! 🎉"')
      .first()
    await expect(celebrationText).toBeVisible({ timeout: 10000 })

    // 7. Wait 4 seconds for the auto-close delay
    await page.waitForTimeout(4000)

    // 8. Navigate to a different product (SECONDARY)
    const secondProductUrl = `https://www.amazon.com/dp/${TEST_CONFIG.AMAZON_PRODUCT_IDS.SECONDARY}`
    await page.goto(secondProductUrl, {
      waitUntil: "load"
    })

    // 9. Wait for the overlay to appear for the second product
    // This is the bug reproduction - overlay should show but won't
    const overlayHostSecondProduct = page
      .locator(
        'plasmo-csui, plasmo-cs-ui, plasmo-cs-overlay, [id^="plasmo-csui"]'
      )
      .first()
    await expect(overlayHostSecondProduct).toBeAttached({ timeout: 20000 })
    await expect(overlayHostSecondProduct).toBeVisible({ timeout: 10000 })
  })
})
