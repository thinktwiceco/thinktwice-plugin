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

      // Create celebration notification with action buttons
      const notificationOptions: chrome.notifications.NotificationOptions<true> =
        {
          type: "basic" as const,
          iconUrl: product.image || "icon128.png",
          title: "🎉 Celebration! You did it!",
          message: `You didn't buy ${product.name}!`,
          contextMessage: product.price
            ? `You saved ${product.price}`
            : "Great job resisting!",
          requireInteraction: false,
          priority: 2,
          buttons: [{ title: "View Product" }, { title: "Not Interested" }]
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
   * Register notification button click handler
   * Handles "View Product" and "Not Interested" button clicks
   * @param storage - Storage interface for accessing reminders and products
   */
  static registerButtonClickListener(storage: IStorage): void {
    if (!this.isAvailable()) {
      console.error(
        "[NotificationService] Cannot register button listener - chrome.notifications is undefined"
      )
      return
    }

    chromeAPI.notifications.onButtonClicked.addListener(
      async (notificationId, buttonIndex) => {
        console.log(
          "[NotificationService] Notification button clicked:",
          notificationId,
          "buttonIndex:",
          buttonIndex
        )

        try {
          // notificationId is the reminderId
          const reminderId = notificationId
          const reminder = await storage.getReminderById(reminderId)

          if (!reminder) {
            console.error(
              "[NotificationService] Reminder not found:",
              reminderId
            )
            chromeAPI.notifications.clear(notificationId)
            return
          }

          const product = await storage.getProduct(reminder.productId)

          if (!product) {
            console.error(
              "[NotificationService] Product not found:",
              reminder.productId
            )
            chromeAPI.notifications.clear(notificationId)
            return
          }

          // Button index 0 = "View Product", index 1 = "Not Interested"
          if (buttonIndex === 0) {
            // View Product: Open product page in new tab and mark reminder as completed
            console.log(
              "[NotificationService] View Product clicked - opening:",
              product.url
            )
            const { TabService } = await import("./TabService")
            await TabService.createTab(product.url)
            await storage.updateReminder(reminderId, { status: "completed" })
            console.log(
              "[NotificationService] Reminder marked as completed:",
              reminderId
            )
          } else if (buttonIndex === 1) {
            // Not Interested: Mark reminder as dismissed
            console.log(
              "[NotificationService] Not Interested clicked - dismissing reminder:",
              reminderId
            )
            await storage.updateReminder(reminderId, { status: "dismissed" })
            console.log(
              "[NotificationService] Reminder marked as dismissed:",
              reminderId
            )
          }

          // Clear the notification
          chromeAPI.notifications.clear(notificationId)
        } catch (error) {
          console.error(
            "[NotificationService] Error handling button click:",
            error
          )
          // Clear notification even on error
          chromeAPI.notifications.clear(notificationId)
        }
      }
    )

    console.log(
      "[NotificationService] Notification button click listener registered"
    )
  }
}
