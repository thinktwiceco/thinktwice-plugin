/**
 * Chrome Badge Service
 *
 * Manages extension badge count and appearance.
 * Calculates and displays count of due reminders.
 */

import type { IStorage } from "../storage/IStorage"
import type { Reminder } from "../storage/types"

const chromeAPI = globalThis.chrome || chrome

export class BadgeService {
  /**
   * Count due reminders from an array
   * A reminder is "due" if it's pending and reminderTime has passed
   * @param reminders - Array of reminders to check
   * @returns Number of due reminders
   */
  static countDueReminders(reminders: Reminder[]): number {
    const now = Date.now()
    return reminders.filter(
      (r) => r.status === "pending" && r.reminderTime <= now
    ).length
  }

  /**
   * Update badge count based on due reminders
   * @param storage - Storage interface for accessing reminders
   */
  static async updateBadgeCount(storage: IStorage): Promise<void> {
    try {
      console.log("[BadgeService] Updating badge count")

      const reminders = await storage.getReminders()
      const dueCount = this.countDueReminders(reminders)

      console.log("[BadgeService] Due reminders:", dueCount)

      if (dueCount > 0) {
        chromeAPI.action.setBadgeText({ text: dueCount.toString() })
        chromeAPI.action.setBadgeBackgroundColor({ color: "#8B5CF6" })
      } else {
        chromeAPI.action.setBadgeText({ text: "" })
      }
    } catch (error) {
      console.error("[BadgeService] Error updating badge:", error)
    }
  }
}
