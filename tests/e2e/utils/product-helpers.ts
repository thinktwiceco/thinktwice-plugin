import type { Page } from "@playwright/test"

import { TEST_CONFIG } from "../test-config"

/**
 * Extract product information from Amazon product page
 */
export async function extractProductInfo(
  page: Page
): Promise<{ name: string | null; price: string | null }> {
  const productName = await page
    .locator(TEST_CONFIG.SELECTORS.PRODUCT_TITLE)
    .first()
    .textContent()

  const productPrice = await page
    .locator(TEST_CONFIG.SELECTORS.PRODUCT_PRICE)
    .first()
    .textContent()

  return {
    name: productName?.trim() || null,
    price: productPrice?.trim() || null
  }
}

/**
 * Build Amazon product URL from product ID
 */
export function buildProductUrl(productId: string): string {
  return `${TEST_CONFIG.BASE_URL}/dp/${productId}`
}

/**
 * Build product storage ID from marketplace and product ID
 */
export function buildProductId(marketplace: string, productId: string): string {
  return `${marketplace}-${productId}`
}

/**
 * Extract product ID from URL
 */
export function extractProductIdFromUrl(url: string): string | null {
  const dpMatch = url.match(/\/dp\/([A-Z0-9]+)/)
  const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]+)/)

  if (dpMatch) {
    return dpMatch[1]
  } else if (gpMatch) {
    return gpMatch[1]
  }

  return null
}


