import { expect, type BrowserContext } from "@playwright/test"

import { TEST_CONFIG } from "../test-config"

/**
 * Helper class for extension-specific operations
 */
export class ExtensionHelper {
  readonly context: BrowserContext
  readonly extensionId: string

  constructor(context: BrowserContext, extensionId: string) {
    this.context = context
    this.extensionId = extensionId
  }

  /**
   * Extract extension ID from service worker
   */
  static async getExtensionId(context: BrowserContext): Promise<string> {
    let [worker] = context.serviceWorkers()
    if (!worker) {
      worker = await context.waitForEvent("serviceworker")
    }
    return worker.url().split("/")[2]
  }

  /**
   * Clear all extension storage
   */
  async clearStorage(): Promise<void> {
    const popupPage = await this.context.newPage()
    await popupPage.goto(`chrome-extension://${this.extensionId}/popup.html`)
    await popupPage.evaluate(() => chrome.storage.local.clear())
    await popupPage.close()
  }

  /**
   * Get storage data for a specific key
   */
  async getStorageData<T = unknown>(key: string): Promise<T | null> {
    const popupPage = await this.context.newPage()
    await popupPage.goto(`chrome-extension://${this.extensionId}/popup.html`)

    const data = await popupPage.evaluate((storageKey) => {
      return new Promise<unknown>((resolve) => {
        chrome.storage.local.get(storageKey, (result) => {
          resolve(result[storageKey] || null)
        })
      })
    }, key)

    await popupPage.close()
    return data as T
  }

  /**
   * Get all products from storage
   */
  async getAllProducts(): Promise<
    Record<string, { state?: string; [key: string]: unknown }>
  > {
    const products = await this.getStorageData<
      Record<string, { state?: string }>
    >(TEST_CONFIG.STORAGE.PRODUCTS)
    return products || {}
  }

  /**
   * Get product state from storage
   */
  async getProductState(productId: string): Promise<string | null> {
    const products = await this.getAllProducts()
    return products[productId]?.state || null
  }

  /**
   * Assert that a product has a specific state in storage
   */
  async assertProductState(
    productId: string,
    expectedState: string
  ): Promise<void> {
    const products = await this.getAllProducts()

    expect(products).toBeDefined()
    expect(products[productId]).toBeDefined()
    expect(products[productId].state).toBe(expectedState)
  }

  /**
   * Get all reminders from storage
   */
  async getAllReminders(): Promise<unknown[]> {
    const reminders = await this.getStorageData<unknown[]>(
      TEST_CONFIG.STORAGE.REMINDERS
    )
    return reminders || []
  }

  /**
   * Check if a reminder exists for a product
   */
  async hasReminder(productId: string): Promise<boolean> {
    const reminders = await this.getAllReminders()
    return reminders.some(
      (r: { productId: string }) => r.productId === productId
    )
  }

  /**
   * Get snooze timestamp from storage
   */
  async getSnoozeUntil(): Promise<number | null> {
    return await this.getStorageData<number>(TEST_CONFIG.STORAGE.SNOOZE)
  }

  /**
   * Check if snooze is active
   */
  async isSnoozeActive(): Promise<boolean> {
    const snoozeUntil = await this.getSnoozeUntil()
    return snoozeUntil !== null && snoozeUntil > Date.now()
  }
}
