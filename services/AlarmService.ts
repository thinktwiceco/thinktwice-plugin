/**
 * Chrome Alarms Service
 *
 * Manages Chrome alarm creation, listening, and restoration.
 * Handles reminder alarms and periodic alarms.
 */

import type { Reminder } from "../storage/types"

const chromeAPI = globalThis.chrome || chrome

export class AlarmService {
  /**
   * Check if chrome.alarms API is available
   */
  static isAvailable(): boolean {
    return (
      typeof chromeAPI !== "undefined" &&
      typeof chromeAPI.alarms !== "undefined"
    )
  }

  /**
   * Create an alarm for a reminder
   * @param reminderId - Unique identifier for the reminder
   * @param when - Timestamp when the alarm should fire
   */
  static createReminderAlarm(reminderId: string, when: number): void {
    if (!this.isAvailable()) {
      console.error("[AlarmService] chrome.alarms is not available")
      return
    }

    try {
      chromeAPI.alarms.create(`reminder_${reminderId}`, {
        when
      })
      console.log("[AlarmService] Created alarm for reminder:", reminderId)
    } catch (error) {
      console.error("[AlarmService] Failed to create alarm:", error)
    }
  }

  /**
   * Create a periodic alarm
   * @param name - Alarm name
   * @param periodInMinutes - Period in minutes
   */
  static createPeriodicAlarm(name: string, periodInMinutes: number): void {
    if (!this.isAvailable()) {
      console.error("[AlarmService] chrome.alarms is not available")
      return
    }

    try {
      chromeAPI.alarms.create(name, {
        periodInMinutes
      })
      console.log(
        "[AlarmService] Created periodic alarm:",
        name,
        "period:",
        periodInMinutes,
        "minutes"
      )
    } catch (error) {
      console.error("[AlarmService] Failed to create periodic alarm:", error)
    }
  }

  /**
   * Clear an alarm for a reminder
   * @param reminderId - Unique identifier for the reminder
   */
  static clearAlarm(reminderId: string): void {
    if (!this.isAvailable()) {
      console.error("[AlarmService] chrome.alarms is not available")
      return
    }

    try {
      chromeAPI.alarms.clear(`reminder_${reminderId}`)
      console.log("[AlarmService] Cleared alarm for reminder:", reminderId)
    } catch (error) {
      console.error("[AlarmService] Failed to clear alarm:", error)
    }
  }

  /**
   * Register alarm listener
   * @param handler - Callback function when alarm fires
   */
  static registerListener(
    handler: (alarm: chrome.alarms.Alarm) => void | Promise<void>
  ): void {
    if (!this.isAvailable()) {
      console.error(
        "[AlarmService] Cannot register listener - chrome.alarms is undefined"
      )
      return
    }

    chromeAPI.alarms.onAlarm.addListener(handler)
    console.log("[AlarmService] Alarm listener registered")
  }

  /**
   * Restore alarms for pending reminders
   * @param reminders - Array of reminders to restore
   * @param overdueHandler - Callback for reminders that are already overdue
   */
  static async restoreAlarms(
    reminders: Reminder[],
    overdueHandler?: (reminder: Reminder) => void | Promise<void>
  ): Promise<void> {
    if (!this.isAvailable()) {
      console.error(
        "[AlarmService] Cannot restore alarms - chrome.alarms unavailable"
      )
      return
    }

    const now = Date.now()

    for (const reminder of reminders) {
      if (reminder.status === "pending" && reminder.reminderTime > now) {
        // Recreate alarm for future reminders
        this.createReminderAlarm(reminder.id, reminder.reminderTime)
        console.log("[AlarmService] Restored alarm for reminder:", reminder.id)
      } else if (
        reminder.status === "pending" &&
        reminder.reminderTime <= now &&
        overdueHandler
      ) {
        // Reminder is overdue - call handler
        console.log("[AlarmService] Found overdue reminder:", reminder.id)
        await overdueHandler(reminder)
      }
    }
  }

  /**
   * Get all active alarms (for debugging)
   */
  static getAllAlarms(callback: (alarms: chrome.alarms.Alarm[]) => void): void {
    if (!this.isAvailable()) {
      console.error(
        "[AlarmService] Cannot get alarms - chrome.alarms unavailable"
      )
      return
    }

    chromeAPI.alarms.getAll(callback)
  }
}
