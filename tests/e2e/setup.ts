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
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
    timezoneId: "America/New_York",
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-site-isolation-trials"
    ]
  })

  const page = await context.newPage()

  // Mask automation indicators to avoid bot detection
  await page.addInitScript(() => {
    // Remove webdriver property
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined
    })

    // Mock plugins to appear like a real browser
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5]
    })

    // Mock languages
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"]
    })

    // Add chrome object ONLY on non-extension pages
    // Don't override the real chrome API on extension pages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!location.href.startsWith("chrome-extension://")) {
      ;(window as any).chrome = { runtime: {} }
    }
  })

  // In headless mode, we can't navigate to chrome:// URLs
  // Instead, verify the extension by loading a real Amazon page
  // and checking if the extension's content script loads
  console.log("Setup: Loading Amazon product page to verify extension...")

  // Set additional headers to mimic real browser
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "sec-ch-ua":
      '"Not_A Brand";v="8", "Chromium";v="131", "Google Chrome";v="131"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"'
  })

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
