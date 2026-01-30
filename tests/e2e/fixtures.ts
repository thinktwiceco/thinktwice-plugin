import path from "path"
import { test as base, chromium, type BrowserContext } from "@playwright/test"

import { ExtensionHelper } from "./page-objects/ExtensionHelper"
import { OverlayPage } from "./page-objects/OverlayPage"
import { PopupPage } from "./page-objects/PopupPage"
import { setAntiDetectionHeaders } from "./utils/extension-helpers"

const EXTENSION_PATH = path.resolve(__dirname, "../../build/chrome-mv3-dev")

type TestFixtures = {
  extensionContext: BrowserContext
  extensionId: string
  extensionHelper: ExtensionHelper
}

/**
 * Playwright test fixtures for ThinkTwice extension testing
 *
 * Provides:
 * - extensionContext: Browser context with extension loaded
 * - extensionId: The extension ID extracted from service worker
 * - extensionHelper: Helper class for extension operations
 *
 * Usage:
 *   import { test, expect } from './fixtures'
 *
 *   test('my test', async ({ extensionContext, extensionId }) => {
 *     // Test code here
 *   })
 */
export const test = base.extend<TestFixtures>({
  // eslint-disable-next-line no-empty-pattern
  extensionContext: async ({}, use) => {
    const userDataDir = path.join(
      __dirname,
      "../../tmp/test-user-data-" + Math.random().toString(36).substring(7)
    )

    const isHeaded = process.env.HEADED === 'true'
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: !isHeaded, // Default headless, set HEADED=true for headed mode
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
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
        "--disable-site-isolation-trials",
        "--window-size=1280,720",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor"
      ]
    })

    // Mask automation indicators to avoid bot detection
    await context.addInitScript(() => {
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

      if (!location.href.startsWith("chrome-extension://")) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).chrome = { runtime: {} }
      }
    })

    await use(context)
    await context.close()
  },

  extensionId: async ({ extensionContext }, use) => {
    const id = await ExtensionHelper.getExtensionId(extensionContext)
    await use(id)
  },

  extensionHelper: async ({ extensionContext, extensionId }, use) => {
    const helper = new ExtensionHelper(extensionContext, extensionId)
    await use(helper)
  }
})

/**
 * Helper function to create an OverlayPage instance
 */
export async function createOverlayPage(
  extensionContext: BrowserContext,
  extensionId: string
) {
  const page = await extensionContext.newPage()
  await setAntiDetectionHeaders(page)
  return new OverlayPage(page, extensionId)
}

/**
 * Helper function to create a PopupPage instance
 */
export async function createPopupPage(
  extensionContext: BrowserContext,
  extensionId: string
) {
  const page = await extensionContext.newPage()
  return new PopupPage(page, extensionId)
}

export { expect } from "@playwright/test"
