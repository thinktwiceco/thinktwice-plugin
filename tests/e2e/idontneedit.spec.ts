import path from "path"
import { chromium, expect, test, type BrowserContext } from "@playwright/test"

const EXTENSION_PATH = path.resolve(__dirname, "../../build/chrome-mv3-dev")

test.describe('ThinkTwice "I don\'t really need it" Flow', () => {
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

  test('should complete the "I don\'t really need it" flow', async () => {
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
    await page.goto("https://www.amazon.com/dp/B005EJH6Z4", {
      waitUntil: "load"
    })

    // 4. Wait for the overlay to be attached
    const overlayHost = page
      .locator(
        'plasmo-csui, plasmo-cs-ui, plasmo-cs-overlay, [id^="plasmo-csui"]'
      )
      .first()
    await expect(overlayHost).toBeAttached({ timeout: 20000 })

    // 5. Click "I don't really need it"
    const dontNeedItButton = overlayHost
      .getByRole("button", { name: /I don't really need it/i })
      .first()
    await expect(dontNeedItButton).toBeVisible({ timeout: 10000 })
    await dontNeedItButton.click()

    // 6. Verify Celebration View
    const celebrationText = overlayHost
      .locator('text="Well done for choosing not to buy! 🎉"')
      .first()
    await expect(celebrationText).toBeVisible({ timeout: 10000 })

    // 7. Verify it auto-closes after roughly 4 seconds
    // Returning null in the component should make the content invisible/gone
    await expect(celebrationText).not.toBeVisible({ timeout: 10000 })
  })
})
