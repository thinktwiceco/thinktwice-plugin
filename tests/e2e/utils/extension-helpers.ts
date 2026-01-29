import type { BrowserContext, Page } from "@playwright/test"

import { TEST_CONFIG } from "../test-config"

/**
 * Extract extension ID from service worker
 */
export async function getExtensionId(context: BrowserContext): Promise<string> {
  let [worker] = context.serviceWorkers()
  if (!worker) {
    worker = await context.waitForEvent("serviceworker")
  }
  return worker.url().split("/")[2]
}

/**
 * Clear all extension storage
 */
export async function clearExtensionStorage(
  context: BrowserContext,
  extensionId: string
): Promise<void> {
  const popupPage = await context.newPage()
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)
  await popupPage.evaluate(() => chrome.storage.local.clear())
  await popupPage.close()
}

/**
 * Navigate to an Amazon product page
 */
export async function navigateToProduct(
  page: Page,
  productId: string
): Promise<void> {
  await page.goto(`${TEST_CONFIG.BASE_URL}/dp/${productId}`, {
    waitUntil: "load"
  })
}

/**
 * Build product URL from product ID
 */
export function buildProductUrl(productId: string): string {
  return `${TEST_CONFIG.BASE_URL}/dp/${productId}`
}
