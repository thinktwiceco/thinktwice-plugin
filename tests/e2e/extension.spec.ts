import path from "path"
import { chromium, expect, test, type BrowserContext } from "@playwright/test"

import { TEST_CONFIG } from "./test-config"

const EXTENSION_PATH = path.resolve(__dirname, "../../build/chrome-mv3-dev")

test.describe("ThinkTwice Plugin E2E", () => {
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
    // We could clean up userDataDir here if needed
  })

  test("should show the ThinkTwice overlay on an Amazon product page", async () => {
    const page = await context.newPage()
    page.on("console", (msg) => console.log("BROWSER LOG:", msg.text()))

    // Find extension ID from service worker.
    console.log("Finding extension service worker...")
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent("serviceworker")
    }
    const extensionId = worker.url().split("/")[2]
    console.log("Extension ID:", extensionId)

    // Clear extension storage to ensure a clean state (no snoozes or closed flags)
    console.log("Clearing extension storage...")
    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)
    await popupPage.evaluate(() => chrome.storage.local.clear())
    await popupPage.close()

    // Navigate to a known valid Amazon product page
    console.log("Navigating to Amazon product page...")
    await page.goto(
      `https://www.amazon.com/dp/${TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY}`,
      {
        waitUntil: "load"
      }
    )

    // Wait for the Plasmo CS anchor to be present
    console.log("Waiting for overlay host...")
    // We found 'plasmo-csui' (no hyphen) in the logs, but including common ones for robustness
    const overlayHost = page
      .locator(
        'plasmo-csui, plasmo-cs-ui, plasmo-cs-overlay, [id^="plasmo-csui"]'
      )
      .first()

    // Wait specifically for the host to be attached
    await expect(overlayHost).toBeAttached({ timeout: 20000 })
    console.log("Overlay host discovered, waiting for internal content...")

    // Check for "ThinkTwice" text inside the shadow DOM
    // Playwright's locator Automatically pierces Shadow Roots
    const titleText = overlayHost
      .locator("h2", { hasText: "ThinkTwice" })
      .first()
    await expect(titleText).toBeVisible({ timeout: 20000 })

    // Verify presence of buttons
    await expect(
      overlayHost
        .getByRole("button", { name: /I don't really need it/i })
        .first()
    ).toBeVisible()
    await expect(
      overlayHost.getByRole("button", { name: /Sleep on it/i }).first()
    ).toBeVisible()
    await expect(
      overlayHost.getByRole("button", { name: /I need it/i }).first()
    ).toBeVisible()
  })
})
