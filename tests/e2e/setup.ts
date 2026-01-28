import path from "path"
import { chromium, expect, test as setup } from "@playwright/test"

const EXTENSION_PATH = path.resolve(__dirname, "../../build/chrome-mv3-dev")

setup("Verify extension is loadable", async () => {
  console.log("Setup: Verifying extension load from", EXTENSION_PATH)

  const userDataDir = path.join(__dirname, "../../tmp/test-user-data-setup")
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true, // Always use headless for stability in CI
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
    "https://www.amazon.com/dp/B0CX23V2ZK",
    { waitUntil: "domcontentloaded" }
  )

  // Wait for the extension to inject its content script
  await page.waitForTimeout(3000)

  // Check if the extension's overlay element exists
  const overlayExists = await page.evaluate(() => {
    return document.querySelector("plasmo-csui") !== null
  })

  console.log("Setup: Extension overlay detected:", overlayExists)
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
