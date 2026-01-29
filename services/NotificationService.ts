/**
 * Chrome Notifications Service
 *
 * Manages Chrome notification creation and event handling.
 * Handles celebration notifications for reminders.
 */

import type { IStorage } from "../storage/IStorage"
import { ProductState } from "../storage/types"

const chromeAPI = globalThis.chrome || chrome

export class NotificationService {
  /**
   * Check if chrome.notifications API is available
   */
  static isAvailable(): boolean {
    return (
      typeof chromeAPI !== "undefined" &&
      typeof chromeAPI.notifications !== "undefined"
    )
  }

  /**
   * Create a celebration notification for a reminder
   * @param reminderId - Unique identifier for the reminder
   * @param storage - Storage interface for accessing reminders and products
   */
  static async createReminderNotification(
    reminderId: string,
    storage: IStorage
  ): Promise<void> {
    if (!this.isAvailable()) {
      console.error(
        "[NotificationService] Cannot create notification - chrome.notifications unavailable"
      )
      return
    }

    try {
      console.log(
        "[NotificationService] Creating notification for reminder:",
        reminderId
      )

      // Get reminder and product data
      const reminder = await storage.getReminderById(reminderId)

      if (!reminder) {
        console.error("[NotificationService] Reminder not found:", reminderId)
        return
      }

      const product = await storage.getProduct(reminder.productId)

      if (!product) {
        console.error(
          "[NotificationService] Product not found:",
          reminder.productId
        )
        return
      }

      // Update product state to "dontNeedIt" since reminder time has passed
      await storage.updateProductState(
        reminder.productId,
        ProductState.DONT_NEED_IT
      )
      console.log("[NotificationService] Product state updated to dontNeedIt")

      // Update reminder status to "completed" so it doesn't trigger again
      await storage.updateReminder(reminderId, { status: "completed" })
      console.log(
        "[NotificationService] Reminder marked as completed:",
        reminderId
      )

      // Format duration for display
      const durationText = this.formatDuration(reminder.duration)

      // Create notification
      const notificationOptions: chrome.notifications.NotificationOptions<true> =
        {
          type: "basic" as const,
          iconUrl: product.image || "icon128.png",
          title: "🎉 You did it!",
          message: `You waited ${durationText} to decide if you want ${product.name}!`,
          requireInteraction: false,
          priority: 2
        }

      chromeAPI.notifications.create(
        reminderId,
        notificationOptions,
        (notificationId) => {
          console.log(
            "[NotificationService] Celebration notification created:",
            notificationId
          )
        }
      )
    } catch (error) {
      console.error("[NotificationService] Error creating notification:", error)
    }
  }

  /**
   * Register notification click handler
   * Opens popup when notification is clicked
   */
  static registerClickListener(): void {
    if (!this.isAvailable()) {
      console.error(
        "[NotificationService] Cannot register listener - chrome.notifications is undefined"
      )
      return
    }

    chromeAPI.notifications.onClicked.addListener((notificationId) => {
      console.log(
        "[NotificationService] Celebration notification clicked:",
        notificationId
      )
      // Open popup when notification is clicked to see achievements
      chromeAPI.action.openPopup()
      chromeAPI.notifications.clear(notificationId)
    })

    console.log("[NotificationService] Notification click listener registered")
  }

  /**
   * Format duration in milliseconds to human-readable string
   * @param durationMs - Duration in milliseconds
   * @returns Formatted duration string
   */
  private static formatDuration(durationMs: number): string {
    const minutes = Math.floor(durationMs / (60 * 1000))
    const hours = Math.floor(durationMs / (60 * 60 * 1000))
    const days = Math.floor(durationMs / (24 * 60 * 60 * 1000))

    if (days > 0) {
      return days === 1 ? "1 day" : `${days} days`
    } else if (hours > 0) {
      return hours === 1 ? "1 hour" : `${hours} hours`
    } else {
      return minutes === 1 ? "1 minute" : `${minutes} minutes`
    }
  }
}
