// Background service worker for handling storage operations
// This is necessary because content scripts don't have direct access to chrome.storage

import { AlarmService } from "./services/AlarmService"
import { BadgeService } from "./services/BadgeService"
import { NotificationService } from "./services/NotificationService"
import { StorageProxyService } from "./services/StorageProxyService"
import { TabService } from "./services/TabService"
import { storage } from "./storage"
import { MessageType } from "./types/messages"
import type { Message } from "./types/messages"

console.log("[Background] ========================================")
console.log("[Background] Service worker STARTING...")
console.log("[Background] Timestamp:", new Date().toISOString())
console.log("[Background] ========================================")

// Ensure chrome APIs are available
if (typeof chrome === "undefined") {
  console.error("[Background] ❌ Chrome API not available!")
}

if (typeof chrome !== "undefined" && typeof chrome.storage === "undefined") {
  console.error("[Background] ❌ chrome.storage not available!")
}

const hasAlarms =
  typeof chrome !== "undefined" && typeof chrome.alarms !== "undefined"
const hasNotifications =
  typeof chrome !== "undefined" && typeof chrome.notifications !== "undefined"

console.log("[Background] Chrome APIs check:", {
  chrome: typeof chrome !== "undefined",
  chromeStorage:
    typeof chrome !== "undefined" && typeof chrome.storage !== "undefined",
  chromeStorageLocal:
    typeof chrome !== "undefined" &&
    typeof chrome.storage !== "undefined" &&
    typeof chrome.storage.local !== "undefined",
  chromeAlarms: hasAlarms,
  chromeNotifications: hasNotifications
})

if (!hasAlarms) {
  console.error(
    "[Background] ❌ chrome.alarms NOT AVAILABLE - Alarms will not work!"
  )
}

if (!hasNotifications) {
  console.error(
    "[Background] ❌ chrome.notifications NOT AVAILABLE - Notifications will not work!"
  )
}

// Use globalThis to access chrome in service worker context
const chromeAPI = globalThis.chrome || chrome

console.log(
  "[Background] Using chrome API from:",
  chromeAPI === globalThis.chrome ? "globalThis" : "direct"
)

chromeAPI.runtime.onMessage.addListener(
  (request: Message, sender, sendResponse) => {
    console.log("[Background] Received message:", request.type, request)

    try {
      if (request.type === MessageType.STORAGE_GET) {
        StorageProxyService.get(request.keys)
          .then((result) => {
            sendResponse({ success: true, data: result })
          })
          .catch((error) => {
            sendResponse({
              success: false,
              error: error.message
            })
          })
        return true // Required for async sendResponse
      }

      if (request.type === MessageType.STORAGE_SET) {
        StorageProxyService.set(request.data)
          .then(() => {
            sendResponse({ success: true })
          })
          .catch((error) => {
            sendResponse({
              success: false,
              error: error.message
            })
          })
        return true
      }

      if (request.type === MessageType.STORAGE_REMOVE) {
        StorageProxyService.remove(request.keys)
          .then(() => {
            sendResponse({ success: true })
          })
          .catch((error) => {
            sendResponse({
              success: false,
              error: error.message
            })
          })
        return true
      }

      if (request.type === MessageType.CREATE_ALARM) {
        console.log(
          "[Background] CREATE_ALARM for reminder:",
          request.reminderId,
          "at",
          request.when
        )
        try {
          AlarmService.createReminderAlarm(request.reminderId, request.when)
          console.log("[Background] Alarm created successfully")
          sendResponse({ success: true })
        } catch (error) {
          console.error("[Background] CREATE_ALARM error:", error)
          sendResponse({ success: false, error: (error as Error).message })
        }
        return false
      }

      if (request.type === MessageType.CLOSE_CURRENT_TAB) {
        console.log(
          "[Background] CLOSE_CURRENT_TAB request from tab:",
          sender.tab?.id
        )
        if (!sender.tab?.id) {
          console.error("[Background] No tab ID available")
          sendResponse({ success: false, error: "No tab ID available" })
          return false
        }

        TabService.closeTab(sender.tab.id)
          .then(() => {
            sendResponse({ success: true })
          })
          .catch((error) => {
            sendResponse({ success: false, error: error.message })
          })
        return true
      }

      if (request.type === MessageType.CREATE_TAB) {
        console.log("[Background] CREATE_TAB request for URL:", request.url)
        TabService.createTab(request.url)
          .then(() => {
            sendResponse({ success: true })
          })
          .catch((error) => {
            sendResponse({ success: false, error: error.message })
          })
        return true
      }

      // TypeScript exhaustiveness check - this should never be reached
      const _exhaustiveCheck: never = request
      console.log(
        "[Background] Unknown message type:",
        (_exhaustiveCheck as Message).type
      )
      sendResponse({ success: false, error: "Unknown message type" })
    } catch (error) {
      console.error("[Background] Error handling message:", error)
      sendResponse({ success: false, error: (error as Error).message })
    }

    return false
  }
)

// ===== Alarm Listener =====
AlarmService.registerListener(async (alarm) => {
  console.log("[Background] Alarm fired:", alarm.name)

  if (alarm.name.startsWith("reminder_")) {
    const reminderId = alarm.name.replace("reminder_", "")
    await NotificationService.createReminderNotification(reminderId, storage)
    await BadgeService.updateBadgeCount(storage)
  } else if (alarm.name === "badge_update") {
    await BadgeService.updateBadgeCount(storage)
  }
})

// ===== Notification Click Handlers =====
NotificationService.registerClickListener()

// ===== Storage Change Listener =====
// Watch for changes to reminders storage and update badge count immediately
if (
  typeof chromeAPI !== "undefined" &&
  typeof chromeAPI.storage !== "undefined" &&
  typeof chromeAPI.storage.onChanged !== "undefined"
) {
  chromeAPI.storage.onChanged.addListener((changes, areaName) => {
    // Only watch local storage changes
    if (areaName !== "local") return

    // Check if reminders storage changed
    if (changes.thinktwice_reminders) {
      console.log(
        "[Background] Reminders storage changed, updating badge count"
      )
      // Update badge count when reminders are added, updated, or deleted
      BadgeService.updateBadgeCount(storage).catch((error) => {
        console.error(
          "[Background] Error updating badge after storage change:",
          error
        )
      })
    }
  })
  console.log("[Background] Storage change listener registered")
} else {
  console.error(
    "[Background] ❌ chrome.storage.onChanged NOT AVAILABLE - Badge won't update on storage changes!"
  )
}

// ===== Service Worker Initialization =====
async function initializeServiceWorker() {
  console.log("[Background] Initializing service worker...")

  try {
    // Get all reminders
    const reminders = await storage.getReminders()
    console.log("[Background] Found", reminders.length, "reminders in storage")

    // Restore alarms for pending reminders and handle overdue ones
    await AlarmService.restoreAlarms(reminders, async (reminder) => {
      // Reminder is overdue - create notification immediately
      await NotificationService.createReminderNotification(reminder.id, storage)
      await BadgeService.updateBadgeCount(storage)
    })

    // Set up periodic badge update alarm
    AlarmService.createPeriodicAlarm("badge_update", 1)

    // Initial badge update
    await BadgeService.updateBadgeCount(storage)

    console.log("[Background] Service worker initialization complete")
  } catch (error) {
    console.error("[Background] Error during initialization:", error)
  }
}

// Run initialization
initializeServiceWorker()
  .then(() => {
    console.log("[Background] ✅ Service worker initialized successfully")

    // Log all alarms for debugging
    AlarmService.getAllAlarms((alarms) => {
      console.log(
        "[Background] Active alarms after initialization:",
        alarms.length
      )
      alarms.forEach((alarm) => {
        console.log(
          "[Background]   -",
          alarm.name,
          "scheduled for",
          new Date(alarm.scheduledTime)
        )
      })
    })
  })
  .catch((error) => {
    console.error("[Background] ❌ Initialization failed:", error)
  })

console.log("[Background] Initialization started...")

export {}
