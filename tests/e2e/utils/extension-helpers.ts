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
 * Set anti-detection headers on a page
 */
export async function setAntiDetectionHeaders(page: Page): Promise<void> {
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "sec-ch-ua":
      '"Not_A Brand";v="8", "Chromium";v="131", "Google Chrome";v="131"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"'
  })
}

/**
 * Navigate to an Amazon product page
 */
export async function navigateToProduct(
  page: Page,
  productId: string
): Promise<void> {
  // Set anti-detection headers before navigating
  await setAntiDetectionHeaders(page)

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
