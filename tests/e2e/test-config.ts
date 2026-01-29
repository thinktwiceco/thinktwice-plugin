/**
 * Test Configuration
 *
 * Centralized configuration for E2E tests.
 * Update product IDs here if they become unavailable on Amazon.
 */

export const TEST_CONFIG = {
  /**
   * Base URL for Amazon
   */
  BASE_URL: "https://www.amazon.com",

  /**
   * Amazon product IDs used across E2E tests.
   * These should be stable, long-lived products.
   */
  AMAZON_PRODUCT_IDS: {
    /**
     * Primary test product - used in most test cases
     * Current: Anker PowerCore 10000 Portable Charger
     */
    PRIMARY: "B005EJH6Z4",

    /**
     * Secondary test product - used for multi-tab scenarios
     * Should be different from PRIMARY to test different products
     */
    SECONDARY: "B07BMKXBVW"
  },

  /**
   * Timeout values in milliseconds
   */
  TIMEOUTS: {
    OVERLAY_ATTACH: 20000,
    BUTTON_VISIBLE: 10000,
    OVERLAY_HIDE: 5000,
    AUTO_CLOSE_DELAY: 4000,
    CELEBRATION_FADE: 6000,
    REMINDER_1MIN: 65000,
    SNOOZE_30S: 31000
  },

  /**
   * Common selectors used across tests
   */
  SELECTORS: {
    OVERLAY_HOST: "#plasmo-overlay-0",
    PRODUCT_TITLE: "#productTitle",
    PRODUCT_PRICE: ".a-price .a-offscreen",
    CLOSE_BUTTON: 'button:has-text("✕")'
  },

  /**
   * Text content for assertions
   */
  TEXT: {
    CELEBRATION_NEED_IT: "Trusting your decision is powerful! 🎉",
    CELEBRATION_DONT_NEED: "Well done for choosing not to buy! 🎉",
    SLEEP_ON_IT_TITLE: "Brilliant choice!",
    SUCCESS_MESSAGE:
      "✓ Reminder saved! Hold tight and remember about the goal!",
    EARLY_RETURN: "You're back!",
    PAUSE_MENU_TITLE: "Pause notifications?",
    DECISION_PROMPT: "Have you made a decision?"
  },

  /**
   * Storage keys used by the extension
   */
  STORAGE: {
    PRODUCTS: "thinktwice_products",
    REMINDERS: "thinktwice_reminders",
    SNOOZE: "thinktwice_snooze",
    GLOBAL_PLUGIN_CLOSED: "thinktwice_global_plugin_closed"
  },

  /**
   * Product state values
   */
  STATES: {
    I_NEED_THIS: "iNeedThis",
    DONT_NEED_IT: "dontNeedIt",
    SLEEPING: "sleeping"
  }
} as const
