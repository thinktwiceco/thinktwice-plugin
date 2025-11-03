/**
 * Product Action Manager
 *
 * Centralized business logic for product state transitions and reminder management.
 * Consolidates duplicate logic across views and ensures consistent behavior.
 */

import { AlarmService } from "~/services/AlarmService"
import { ChromeMessaging } from "~/services/ChromeMessaging"
import { storage } from "~/storage"
import type { Product, Reminder } from "~/storage/types"
import { ProductState } from "~/storage/types"

export class ProductActionManager {
  /**
   * Action: "I don't need it"
   * Updates product state to "dontNeedIt"
   * @param product - Product object
   */
  static async dontNeedIt(product: Product): Promise<void> {
    try {
      console.log("[ProductActionManager] dontNeedIt - productId:", product.id)

      // Check if product exists
      const existingProduct = await storage.getProduct(product.id)

      if (!existingProduct) {
        // Product doesn't exist, create it with dontNeedIt state
        await storage.saveProduct({
          ...product,
          state: ProductState.DONT_NEED_IT
        })
        console.log(
          "[ProductActionManager] Product created with dontNeedIt state"
        )
      } else {
        // Product exists, just update the state
        await storage.updateProductState(product.id, ProductState.DONT_NEED_IT)
        console.log(
          "[ProductActionManager] Product state updated to dontNeedIt"
        )
      }
    } catch (error) {
      console.error(
        "[ProductActionManager] Failed to update product state:",
        error
      )
      throw error
    }
  }

  /**
   * Action: "Sleep on it"
   * Updates product state to "sleepingOnIt"
   * Creates reminder if it doesn't exist
   * Creates Chrome alarm for notification
   * @param product - Product to sleep on
   * @param duration - Duration in milliseconds
   * @returns reminderId
   */
  static async sleepOnIt(product: Product, duration: number): Promise<string> {
    try {
      console.log(
        "[ProductActionManager] sleepOnIt - product:",
        product.id,
        "duration:",
        duration
      )

      // Save product with sleepingOnIt state
      await storage.saveProduct({
        ...product,
        state: ProductState.SLEEPING_ON_IT
      })
      console.log(
        "[ProductActionManager] Product saved with sleepingOnIt state"
      )

      // Create reminder
      const reminder: Reminder = {
        id: crypto.randomUUID(),
        productId: product.id,
        reminderTime: Date.now() + duration,
        duration: duration,
        status: "pending"
      }

      await storage.saveReminder(reminder)
      console.log("[ProductActionManager] Reminder saved:", reminder.id)

      // Create alarm for reminder
      try {
        await ChromeMessaging.createAlarm(reminder.id, reminder.reminderTime)
        console.log("[ProductActionManager] Alarm created successfully")
      } catch (error) {
        console.error("[ProductActionManager] Failed to create alarm:", error)
        // Don't throw - reminder is saved, alarm is optional
      }

      return reminder.id
    } catch (error) {
      console.error("[ProductActionManager] Failed to sleep on it:", error)
      throw error
    }
  }

  /**
   * Action: "I need it"
   * Updates product state to "iNeedThis"
   * Deletes reminder if exists
   * Clears alarm if exists
   * @param productId - ID of the product
   * @param reminderId - Optional reminder ID to delete
   */
  static async needIt(productId: string, reminderId?: string): Promise<void> {
    try {
      console.log(
        "[ProductActionManager] needIt - productId:",
        productId,
        "reminderId:",
        reminderId
      )

      // Update product state
      await storage.updateProductState(productId, ProductState.I_NEED_THIS)
      console.log("[ProductActionManager] Product state updated to iNeedThis")

      // Delete reminder if exists
      if (reminderId) {
        await storage.deleteReminder(reminderId)
        console.log("[ProductActionManager] Reminder deleted:", reminderId)

        // Clear alarm
        AlarmService.clearAlarm(reminderId)
        console.log(
          "[ProductActionManager] Alarm cleared for reminder:",
          reminderId
        )
      }
    } catch (error) {
      console.error("[ProductActionManager] Failed to mark as need it:", error)
      throw error
    }
  }

  /**
   * Action: "Changed my mind"
   * Sets product state to null
   * Deletes reminder if exists
   * Clears alarm if exists
   * @param productId - ID of the product
   * @param reminderId - Optional reminder ID to delete
   */
  static async changedMyMind(
    productId: string,
    reminderId?: string
  ): Promise<void> {
    try {
      console.log(
        "[ProductActionManager] changedMyMind - productId:",
        productId,
        "reminderId:",
        reminderId
      )

      // Set product state to null
      await storage.updateProductState(productId, null)
      console.log("[ProductActionManager] Product state set to null")

      // Delete reminder if exists
      if (reminderId) {
        await storage.deleteReminder(reminderId)
        console.log("[ProductActionManager] Reminder deleted:", reminderId)

        // Clear alarm
        AlarmService.clearAlarm(reminderId)
        console.log(
          "[ProductActionManager] Alarm cleared for reminder:",
          reminderId
        )
      }
    } catch (error) {
      console.error(
        "[ProductActionManager] Failed to handle changed mind:",
        error
      )
      throw error
    }
  }
}
