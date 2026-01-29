import { expect, type BrowserContext } from "@playwright/test"

/**
 * Get product state from storage
 */
export async function getProductState(
  context: BrowserContext,
  extensionId: string,
  productId: string
): Promise<string | null> {
  const products = await getAllProducts(context, extensionId)
  return products[productId]?.state || null
}

/**
 * Assert product has expected state in storage
 */
export async function assertProductState(
  context: BrowserContext,
  extensionId: string,
  productId: string,
  expectedState: string
): Promise<void> {
  const popupPage = await context.newPage()
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)

  const storageData = (await popupPage.evaluate(() => {
    return new Promise<Record<string, { state?: string }>>((resolve) => {
      chrome.storage.local.get("thinktwice_products", (result) => {
        resolve(
          (result.thinktwice_products as Record<string, { state?: string }>) ||
            {}
        )
      })
    })
  })) as Record<string, { state?: string }>

  await popupPage.close()

  expect(storageData).toBeDefined()
  expect(storageData[productId]).toBeDefined()
  expect(storageData[productId].state).toBe(expectedState)
}

/**
 * Get all products from storage
 */
export async function getAllProducts(
  context: BrowserContext,
  extensionId: string
): Promise<Record<string, { state?: string; [key: string]: unknown }>> {
  const popupPage = await context.newPage()
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)

  const products = await popupPage.evaluate(() => {
    return new Promise<Record<string, unknown>>((resolve) => {
      chrome.storage.local.get("thinktwice_products", (result) => {
        resolve((result.thinktwice_products as Record<string, unknown>) || {})
      })
    })
  })

  await popupPage.close()
  return products
}

/**
 * Get all reminders from storage
 */
export async function getAllReminders(
  context: BrowserContext,
  extensionId: string
): Promise<unknown[]> {
  const popupPage = await context.newPage()
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)

  const reminders = await popupPage.evaluate(() => {
    return new Promise<unknown[]>((resolve) => {
      chrome.storage.local.get("thinktwice_reminders", (result) => {
        resolve((result.thinktwice_reminders as unknown[]) || [])
      })
    })
  })

  await popupPage.close()
  return reminders
}

/**
 * Expect product to have a specific state
 */
export async function expectProductState(
  context: BrowserContext,
  extensionId: string,
  productId: string,
  expectedState: string
): Promise<void> {
  await assertProductState(context, extensionId, productId, expectedState)
}

/**
 * Expect reminder to exist for a product
 */
export async function expectReminderExists(
  context: BrowserContext,
  extensionId: string,
  productId: string
): Promise<void> {
  const reminders = await getAllReminders(context, extensionId)
  const hasReminder = reminders.some((r) => r.productId === productId)
  expect(hasReminder).toBe(true)
}

/**
 * Check if snooze is active
 */
export async function expectSnoozeActive(
  context: BrowserContext,
  extensionId: string
): Promise<void> {
  const popupPage = await context.newPage()
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)

  const snoozeUntil = await popupPage.evaluate(() => {
    return new Promise<number | null>((resolve) => {
      chrome.storage.local.get("thinktwice_snooze", (result) => {
        resolve((result.thinktwice_snooze as number) || null)
      })
    })
  })

  await popupPage.close()

  expect(snoozeUntil).not.toBeNull()
  expect(snoozeUntil).toBeGreaterThan(Date.now())
}

/**
 * Expect storage to be empty
 */
export async function expectStorageEmpty(
  context: BrowserContext,
  extensionId: string
): Promise<void> {
  const products = await getAllProducts(context, extensionId)
  const reminders = await getAllReminders(context, extensionId)

  expect(Object.keys(products).length).toBe(0)
  expect(reminders.length).toBe(0)
}
