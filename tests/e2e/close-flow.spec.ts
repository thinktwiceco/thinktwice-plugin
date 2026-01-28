import path from "path"
import { chromium, expect, test, type BrowserContext } from "@playwright/test"

const EXTENSION_PATH = path.resolve(__dirname, "../../build/chrome-mv3-dev")

test.describe('ThinkTwice "Close and Pause" Flow', () => {
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

  async function getOverlayHost(page) {
    const overlayHost = page.locator('plasmo-csui, [id^="plasmo-csui"]').first()
    await expect(overlayHost).toBeAttached({ timeout: 20000 })
    return overlayHost
  }

  async function clearExtensionStorage(extensionId) {
    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)
    await popupPage.evaluate(() => chrome.storage.local.clear())
    await popupPage.close()
  }

  test('should handle "Close for now" (Tab Session Only)', async () => {
    const page = await context.newPage()

    // 1. Find extension ID
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent("serviceworker")
    }
    const extensionId = worker.url().split("/")[2]

    // 2. Clear storage
    await clearExtensionStorage(extensionId)

    // 3. Navigate to Amazon product page
    await page.goto("https://www.amazon.com/dp/B005EJH6Z4", {
      waitUntil: "load"
    })

    // 4. Wait for the overlay
    const overlayHost = await getOverlayHost(page)

    // 5. Click the Close (X) button in the header
    const closeButton = overlayHost.locator('button:has-text("✕")')
    await expect(closeButton).toBeVisible({ timeout: 10000 })
    await closeButton.click()

    // 6. Verify Pause Menu is visible
    const pauseMenuTitle = overlayHost.locator('text="Pause notifications?"')
    await expect(pauseMenuTitle).toBeVisible({ timeout: 5000 })

    // 7. Click "Close for now"
    const closeForNowButton = overlayHost.locator(
      'button:has-text("Close for now")'
    )
    await closeForNowButton.click()

    // 8. Verify overlay is gone
    await expect(overlayHost).not.toBeVisible({ timeout: 5000 })

    // 9. Reload the same page
    await page.reload({ waitUntil: "load" })

    // 10. Verify overlay remains hidden in this tab
    // Note: The overlay host might still be attached but its content should be null (hidden)
    // or the host itself might not be visible.
    await expect(overlayHost).not.toBeVisible({ timeout: 5000 })

    // 11. Open a NEW tab to the same product
    const newPage = await context.newPage()
    await newPage.goto("https://www.amazon.com/dp/B005EJH6Z4", {
      waitUntil: "load"
    })

    // 12. Verify overlay IS visible in the new tab (since it's not a snooze)
    const newOverlayHost = await getOverlayHost(newPage)
    await expect(
      newOverlayHost.locator('text="ThinkTwice"').first()
    ).toBeVisible({ timeout: 20000 })
  })

  test('should handle "Pause for 1 hour" (Global Snooze)', async () => {
    const page = await context.newPage()

    // 1. Find extension ID
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent("serviceworker")
    }
    const extensionId = worker.url().split("/")[2]

    // 2. Clear storage
    await clearExtensionStorage(extensionId)

    // 3. Navigate to Amazon product page
    await page.goto("https://www.amazon.com/dp/B005EJH6Z4", {
      waitUntil: "load"
    })

    // 4. Wait for the overlay
    const overlayHost = await getOverlayHost(page)

    // 5. Open Pause Menu
    const closeButton = overlayHost.locator('button:has-text("✕")')
    await closeButton.click()

    // 6. Click "Pause for 1 hour"
    const pause1HourButton = overlayHost.locator(
      'button:has-text("Pause for 1 hour")'
    )
    await pause1HourButton.click()

    // 7. Verify overlay is gone
    await expect(overlayHost).not.toBeVisible({ timeout: 5000 })

    // 8. Navigate to a DIFFERENT product page in a NEW tab
    const newPage = await context.newPage()
    await newPage.goto("https://www.amazon.com/dp/B08L5S6SMM", {
      waitUntil: "load"
    })

    // 9. Verify overlay is NOT shown (global snooze active)
    const newOverlayHost = newPage
      .locator('plasmo-csui, [id^="plasmo-csui"]')
      .first()
    // Since it's global snooze, hideOverlay returns true, and the component returns null
    await expect(newOverlayHost).not.toBeVisible({ timeout: 10000 })
  })

  test('should handle "Cancel" in Pause Menu', async () => {
    const page = await context.newPage()

    // 1. Find extension ID
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent("serviceworker")
    }
    const extensionId = worker.url().split("/")[2]

    // 2. Clear storage
    await clearExtensionStorage(extensionId)

    // 3. Navigate to Amazon product page
    await page.goto("https://www.amazon.com/dp/B005EJH6Z4", {
      waitUntil: "load"
    })

    // 4. Wait for the overlay
    const overlayHost = await getOverlayHost(page)

    // 5. Open Pause Menu
    const closeButton = overlayHost.locator('button:has-text("✕")')
    await closeButton.click()

    // 6. Click "Cancel"
    const cancelButton = overlayHost.locator('button:has-text("Cancel")')
    await cancelButton.click()

    // 7. Verify Pause Menu is gone but Overlay is still there
    const pauseMenuTitle = overlayHost.locator('text="Pause notifications?"')
    await expect(pauseMenuTitle).not.toBeVisible({ timeout: 5000 })

    const iDontNeedItButton = overlayHost.getByRole("button", {
      name: /I don't really need it/i
    })
    await expect(iDontNeedItButton).toBeVisible({ timeout: 5000 })
  })
})
