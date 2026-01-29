import { expect, type Locator, type Page } from "@playwright/test"

import { TEST_CONFIG } from "../test-config"

/**
 * Page Object for the extension popup
 */
export class PopupPage {
  readonly page: Page
  readonly extensionId: string

  constructor(page: Page, extensionId: string) {
    this.page = page
    this.extensionId = extensionId
  }

  /**
   * Navigate to the popup page
   */
  async goto(): Promise<void> {
    await this.page.goto(`chrome-extension://${this.extensionId}/popup.html`)
    await this.page.waitForLoadState("load")
  }

  /**
   * Get the "Sleeping on it" section
   */
  getSleepingSection(): Locator {
    return this.page.locator('h3:has-text("Sleeping on it")')
  }

  /**
   * Get the "Achievements" section
   */
  getAchievementsSection(): Locator {
    return this.page.locator('h3:has-text("Achievements - You resisted! 🎉")')
  }

  /**
   * Get a product card by product name
   */
  getProductCard(productName: string): Locator {
    return this.page.locator(`text="${productName.trim()}"`)
  }

  /**
   * Get the savings text element
   */
  getSavingsText(): Locator {
    return this.page.locator("text=/Saving: \\$/i")
  }

  /**
   * Get the saved amount text element
   */
  getSavedText(): Locator {
    return this.page.locator("text=/Saved: \\$/i")
  }

  /**
   * Get the encouraging message
   */
  getEncouragingMessage(): Locator {
    return this.page.locator('text="You can do this! 💪"')
  }

  /**
   * Get the reminder time text
   */
  getReminderText(): Locator {
    return this.page.locator("text=/Reminder: in/i")
  }

  /**
   * Click "I changed my mind" button
   */
  async clickChangedMyMind(): Promise<void> {
    const button = this.page.getByRole("button", {
      name: /I changed my mind/i
    })
    await expect(button).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    await button.click()
  }

  /**
   * Click "Remove Snooze" button
   */
  async removeSnooze(): Promise<void> {
    const button = this.page.locator('button:has-text("Remove Snooze")')
    await expect(button).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    await button.click()
  }

  /**
   * Expect a product to be in the "Sleeping on it" section
   */
  async expectProductInSleeping(
    productName: string,
    timeout?: number
  ): Promise<void> {
    await expect(this.getSleepingSection()).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    const productCard = this.getProductCard(productName)
    await expect(productCard).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  }

  /**
   * Expect a product NOT to be in the "Sleeping on it" section
   */
  async expectProductNotInSleeping(
    productName: string,
    timeout?: number
  ): Promise<void> {
    const sleepingSection = this.getSleepingSection()
    const count = await sleepingSection.count()

    if (count > 0) {
      const productCard = this.getProductCard(productName)
      await expect(productCard).not.toBeVisible({
        timeout: timeout || TEST_CONFIG.TIMEOUTS.OVERLAY_HIDE
      })
    } else {
      await expect(sleepingSection).not.toBeVisible({
        timeout: timeout || TEST_CONFIG.TIMEOUTS.OVERLAY_HIDE
      })
    }
  }

  /**
   * Expect a product to be in the "Achievements" section
   */
  async expectProductInAchievements(
    productName: string,
    timeout?: number
  ): Promise<void> {
    await expect(this.getAchievementsSection()).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    const productCard = this.getProductCard(productName).last()
    await expect(productCard).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  }

  /**
   * Expect savings total to be displayed
   */
  async expectSavingsTotal(timeout?: number): Promise<void> {
    await expect(this.getSavingsText()).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  }

  /**
   * Expect saved amount to be displayed
   */
  async expectSavedAmount(timeout?: number): Promise<void> {
    await expect(this.getSavedText()).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  }

  /**
   * Expect encouraging message to be visible
   */
  async expectEncouragingMessage(timeout?: number): Promise<void> {
    await expect(this.getEncouragingMessage()).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  }

  /**
   * Expect reminder text to be visible
   */
  async expectReminderText(timeout?: number): Promise<void> {
    await expect(this.getReminderText()).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  }

  /**
   * Reload the popup page
   */
  async reload(): Promise<void> {
    await this.page.reload()
    await this.page.waitForLoadState("load")
  }

  /**
   * Get the plugin disabled banner
   */
  getPluginDisabledBanner(): Locator {
    return this.page.locator('text="🔴 Plugin is currently disabled"')
  }

  /**
   * Get the re-enable button
   */
  getReEnableButton(): Locator {
    return this.page.getByRole("button", { name: /Re-enable ThinkTwice/i })
  }

  /**
   * Click the re-enable button
   */
  async clickReEnable(): Promise<void> {
    const button = this.getReEnableButton()
    await expect(button).toBeVisible({
      timeout: TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
    await button.click()
  }

  /**
   * Expect plugin to be disabled (banner visible)
   */
  async expectPluginDisabled(timeout?: number): Promise<void> {
    await expect(this.getPluginDisabledBanner()).toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.BUTTON_VISIBLE
    })
  }

  /**
   * Expect plugin to be enabled (banner not visible)
   */
  async expectPluginEnabled(timeout?: number): Promise<void> {
    await expect(this.getPluginDisabledBanner()).not.toBeVisible({
      timeout: timeout || TEST_CONFIG.TIMEOUTS.OVERLAY_HIDE
    })
  }
}
