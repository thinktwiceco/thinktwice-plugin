/**
 * Test Configuration
 *
 * Centralized configuration for E2E tests.
 * Update product IDs here if they become unavailable on Amazon.
 */

export const TEST_CONFIG = {
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
     * Current: Same as PRIMARY for consistency
     */
    SECONDARY: "B07BMKXBVW"
  }
} as const
