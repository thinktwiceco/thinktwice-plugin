import { expect, type Locator, type Page } from "@playwright/test"

import { TEST_CONFIG } from "../test-config"

/**
 * Wait for the overlay to be attached to the DOM
 */
export async function waitForOverlayAttached(
  page: Page,
  timeout?: number
): Promise<Locator> {
  const overlayHost = page.locator(TEST_CONFIG.SELECTORS.OVERLAY_HOST).first()
  await expect(overlayHost).toBeAttached({
    timeout: timeout || TEST_CONFIG.TIMEOUTS.OVERLAY_ATTACH
  })
  return overlayHost
}

/**
 * Wait for the overlay to be hidden/removed
 */
export async function waitForOverlayHidden(
  page: Page,
  timeout?: number
): Promise<void> {
  const overlayHost = page.locator(TEST_CONFIG.SELECTORS.OVERLAY_HOST).first()
  await expect(overlayHost).not.toBeVisible({
    timeout: timeout || TEST_CONFIG.TIMEOUTS.OVERLAY_HIDE
  })
}

/**
 * Wait for a specific celebration message to appear
 */
export async function waitForCelebration(
  overlayHost: Locator,
  message: string,
  timeout?: number
): Promise<void> {
  const celebrationText = overlayHost.locator(`text="${message}"`).first()
  await expect(celebrationText).toBeVisible({
    timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
  })
}

/**
 * Wait for celebration to disappear
 */
export async function waitForCelebrationHidden(
  overlayHost: Locator,
  message: string,
  timeout?: number
): Promise<void> {
  const celebrationText = overlayHost.locator(`text="${message}"`).first()
  await expect(celebrationText).not.toBeVisible({
    timeout: timeout || TEST_CONFIG.TIMEOUTS.CELEBRATION_FADE
  })
}


