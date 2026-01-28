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
  await page.goto("chrome://extensions")

  // Wait for the extensions list to load
  await page.waitForTimeout(2000)

  // Try to find the extension name to verify it's loaded
  const extensionNames = await page.evaluate(() => {
    const manager = document.querySelector("extensions-manager")
    if (!manager) return []
    const itemList = manager.shadowRoot?.querySelector("extensions-item-list")
    if (!itemList) return []
    const items = Array.from(
      itemList.shadowRoot?.querySelectorAll("extensions-item") || []
    )
    return items.map(
      (item) => item.shadowRoot?.querySelector("#name")?.textContent
    )
  })

  console.log("Extensions found during setup:", extensionNames)

  // Check if "Maurice plugin" or "ThinkTwice" is in the list
  const isLoaded = extensionNames.some(
    (name) => name?.includes("Maurice plugin") || name?.includes("ThinkTwice")
  )
  expect(isLoaded).toBe(true)

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
