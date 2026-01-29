import path from "path"
import { chromium, expect, test as setup } from "@playwright/test"

import { TEST_CONFIG } from "./test-config"

const EXTENSION_PATH = path.resolve(__dirname, "../../build/chrome-mv3-dev")

setup("Verify extension is loadable", async () => {
  console.log("Setup: Verifying extension load from", EXTENSION_PATH)

  const userDataDir = path.join(__dirname, "../../tmp/test-user-data-setup")
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: process.env.CI ? true : false, // Headless in CI, headed locally for debugging
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  })

  const page = await context.newPage()

  // In headless mode, we can't navigate to chrome:// URLs
  // Instead, verify the extension by loading a real Amazon page
  // and checking if the extension's content script loads
  console.log("Setup: Loading Amazon product page to verify extension...")

  await page.goto(
    `https://www.amazon.com/dp/${TEST_CONFIG.AMAZON_PRODUCT_IDS.PRIMARY}`,
    { waitUntil: "load" }
  )

  // Plasmo injects a custom element with the tag 'plasmo-csui'
  // We'll wait for this standard selector
  const selector = "plasmo-csui"
  try {
    console.log(`Setup: Waiting for selector "${selector}"...`)
    await page.waitForSelector(selector, { timeout: 20000, state: "attached" })
  } catch {
    console.log(
      "Setup: Timed out waiting for overlay. Page title:",
      await page.title()
    )
  }

  // Check if the extension's overlay element exists
  const overlayExists = await page.evaluate(() => {
    return document.querySelector("plasmo-csui") !== null
  })

  console.log("Setup: Extension overlay detected:", overlayExists)
  if (!overlayExists) {
    console.log(
      "Debug: Page content snippet:",
      (await page.content()).slice(0, 500)
    )
  }
  expect(overlayExists).toBe(true)

  // Ensure proper cleanup to prevent worker teardown timeout
  try {
    await context.close()
    console.log("Setup: Extension verification successful")
  } catch (error) {
    console.error("Error closing context:", error)
    // Force kill browser if normal close fails
    try {
      await context.browser()?.close()
    } catch (e) {
      console.error("Error force-closing browser:", e)
    }
  }
})
