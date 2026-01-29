import path from "path"
import { test as base, chromium, type BrowserContext } from "@playwright/test"

import { ExtensionHelper } from "./page-objects/ExtensionHelper"
import { OverlayPage } from "./page-objects/OverlayPage"
import { PopupPage } from "./page-objects/PopupPage"

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

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: !!process.env.CI || process.env.HEADLESS === "true",
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
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
