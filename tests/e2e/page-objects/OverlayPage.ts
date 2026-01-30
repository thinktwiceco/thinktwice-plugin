import { expect, type Locator, type Page } from "@playwright/test"

import { TEST_CONFIG } from "../test-config"

/**
 * Page Object for the ThinkTwice overlay that appears on product pages
 */
export class OverlayPage {
  readonly page: Page
  readonly extensionId: string

  constructor(page: Page, extensionId: string) {
    this.page = page
    this.extensionId = extensionId
  }

  /**
   * Get the overlay host element (plasmo shadow root)
   */
  getOverlayHost(): Locator {
    return this.page.locator(TEST_CONFIG.SELECTORS.OVERLAY_HOST).first()
  }

  /**
   * Get a button by name within the overlay
   */
  getButton(name: string | RegExp): Locator {
    return this.getOverlayHost().getByRole("button", { name }).first()
  }

  /**
   * Get celebration text within the overlay
   */
  getCelebrationText(message: string): Locator {
    return this.getOverlayHost().locator(`text="${message}"`).first()
  }

  /**
   * Get any text locator within the overlay
   */
  getText(text: string | RegExp): Locator {
    return this.getOverlayHost().locator(
      typeof text === "string" ? `text="${text}"` : `text=${text}`
    )
  }

  /**
   * Click "I need it" button
   */
  async clickINeedIt(): Promise<void> {
    const button = this.getButton(/I need it/i)
    await expect(button).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    await button.click()
  }

  /**
   * Click "I don't really need it" button
   */
  async clickIDontNeedIt(): Promise<void> {
    const button = this.getButton(/I don't really need it/i)
    await expect(button).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    await button.click()
  }

  /**
   * Click "Sleep on it" button
   */
  async clickSleepOnIt(): Promise<void> {
    const button = this.getButton(/Sleep on it/i)
    await expect(button).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    await button.click()
  }

  /**
   * Click the close (X) button
   */
  async clickClose(): Promise<void> {
    const closeButton = this.getOverlayHost().locator(
      TEST_CONFIG.SELECTORS.CLOSE_BUTTON
    )
    await expect(closeButton).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    await closeButton.click()
  }

  /**
   * Select a duration option (e.g., "1 minute", "24 hours", "3 days")
   */
  async selectDuration(duration: string | RegExp): Promise<void> {
    const button = this.getButton(duration)
    await expect(button).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    await button.click()
  }

  /**
   * Click "Set Reminder" button
   */
  async clickSetReminder(): Promise<void> {
    const button = this.getButton(/Set Reminder/i)
    await expect(button).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    await button.click()
  }

  /**
   * Click any button by name
   */
  async clickButton(name: string | RegExp): Promise<void> {
    const button = this.getButton(name)
    await expect(button).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    await button.click()
  }

  /**
   * Wait for overlay to be attached to the DOM
   */
  async expectAttached(timeout?: number): Promise<void> {
    await expect(this.getOverlayHost()).toBeAttached({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.OVERLAY_ATTACH
    })
  }

  /**
   * Expect the overlay to be visible
   */
  async expectVisible(timeout?: number): Promise<void> {
    await expect(this.getOverlayHost()).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  }

  /**
   * Expect the overlay to be hidden
   */
  async expectHidden(timeout?: number): Promise<void> {
    await expect(this.getOverlayHost()).not.toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.OVERLAY_HIDE
    })
  }

  /**
   * Expect a specific celebration message to be visible
   */
  async expectCelebrationVisible(
    message: string,
    timeout?: number
  ): Promise<void> {
    const celebration = this.getCelebrationText(message)
    await expect(celebration).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  }

  /**
   * Expect celebration to be hidden
   */
  async expectCelebrationHidden(
    message: string,
    timeout?: number
  ): Promise<void> {
    const celebration = this.getCelebrationText(message)
    await expect(celebration).not.toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.CELEBRATION_FADE
    })
  }

  /**
   * Expect the success message to be visible
   */
  async expectSuccessMessage(timeout?: number): Promise<void> {
    const successMessage = this.getCelebrationText(
      TEST_CONFIG.TEXT.SUCCESS_MESSAGE
    )
    await expect(successMessage).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  }

  /**
   * Expect a specific text to be visible in the overlay
   */
  async expectTextVisible(text: string, timeout?: number): Promise<void> {
    const textElement = this.getText(text)
    await expect(textElement).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  }

  /**
   * Expect a specific text to be hidden in the overlay
   */
  async expectTextHidden(text: string, timeout?: number): Promise<void> {
    const textElement = this.getText(text)
    await expect(textElement).not.toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.OVERLAY_HIDE
    })
  }
}
