/**
 * Browser Storage - Domain-Specific Storage Layer
 *
 * HIGH-LEVEL storage service for domain operations (Reminders, Products, Settings).
 *
 * ROLE:
 * - Provides typed, domain-specific methods for all storage operations
 * - Automatically adapts to the execution context (background vs content script)
 * - Handles message passing when direct storage access is unavailable
 *
 * CONTEXT: Works in ALL contexts (background, popup, content scripts)
 *
 * WHEN TO USE:
 * - ALWAYS use this for application-level storage operations
 * - Use throughout the codebase via: import { storage } from "~/storage"
 *
 * WHEN NOT TO USE:
 * - DON'T use this in background.ts message handlers (use StorageProxyService)
 * - DON'T use this if you need low-level chrome.storage operations
 *
 * HOW IT WORKS:
 * 1. Checks if direct chrome.storage.local access is available
 * 2. If YES (background/popup): Uses chrome.storage.local directly
 * 3. If NO (content script): Sends STORAGE_GET/SET messages to background
 *
 * ARCHITECTURE:
 * Background Script:  BrowserStorage → chrome.storage.local (direct)
 * Content Script:     BrowserStorage → Message → Background → StorageProxyService → chrome.storage.local
 *
 * EXPORTED AS: Singleton instance `storage` in storage/index.ts
 *
 * See: StorageProxyService.ts for the low-level storage proxy used by background.ts
 */

import { MessageType } from "../types/messages"
import type { MessageResponse } from "../types/messages"
import type { IStorage } from "./IStorage"
import type { Product, Reminder, Settings, TabSessionState } from "./types"
import { DEFAULT_SETTINGS } from "./types"

const STORAGE_KEYS = {
  REMINDERS: "thinktwice_reminders",
  PRODUCTS: "thinktwice_products",
  SETTINGS: "thinktwice_settings",
  TAB_SESSION_STATE: "thinktwice_tab_session_state",
  SNOOZE: "thinktwice_snooze"
}

// Helper to determine if we're in a context with direct chrome.storage access
const hasDirectStorageAccess = (): boolean => {
  try {
    return (
      typeof chrome !== "undefined" &&
      typeof chrome.storage !== "undefined" &&
      typeof chrome.storage.local !== "undefined"
    )
  } catch {
    return false
  }
}

// Helper to use message passing when direct access is not available
const sendStorageMessage = <T>(
  type: MessageType,
  payload: Record<string, unknown>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    try {
      console.log("[BrowserStorage] Sending message:", type, payload)
      chrome.runtime.sendMessage(
        { type, ...payload },
        (response: MessageResponse<T>) => {
          console.log(
            "[BrowserStorage] Received response:",
            response,
            "lastError:",
            chrome.runtime.lastError
          )
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else if (response?.success) {
            resolve(response.data)
          } else {
            reject(new Error("Storage operation failed - no success response"))
          }
        }
      )
    } catch (error) {
      console.error("[BrowserStorage] Exception in sendStorageMessage:", error)
      reject(error)
    }
  })
}

// Wrapper for chrome.storage operations that works in all contexts
const storageGet = async (
  keys: string | string[]
): Promise<Record<string, unknown>> => {
  const hasDirect = hasDirectStorageAccess()
  console.log(
    "[BrowserStorage] storageGet - hasDirectStorageAccess:",
    hasDirect
  )

  if (hasDirect) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve)
    })
  } else {
    return sendStorageMessage(MessageType.STORAGE_GET, { keys })
  }
}

const storageSet = async (data: Record<string, unknown>): Promise<void> => {
  const hasDirect = hasDirectStorageAccess()
  console.log(
    "[BrowserStorage] storageSet - hasDirectStorageAccess:",
    hasDirect
  )

  if (hasDirect) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, resolve)
    })
  } else {
    await sendStorageMessage(MessageType.STORAGE_SET, { data })
  }
}

export class BrowserStorage implements IStorage {
  async getReminders(): Promise<Reminder[]> {
    try {
      const result = await storageGet(STORAGE_KEYS.REMINDERS)
      return (result[STORAGE_KEYS.REMINDERS] as Reminder[]) || []
    } catch (error) {
      console.error("Failed to get reminders:", error)
      return []
    }
  }

  async getReminderById(id: string): Promise<Reminder | null> {
    try {
      const reminders = await this.getReminders()
      return reminders.find((r) => r.id === id) || null
    } catch (error) {
      console.error("Failed to get reminder by id:", error)
      return null
    }
  }

  async saveReminder(reminder: Reminder): Promise<void> {
    try {
      const reminders = await this.getReminders()
      reminders.push(reminder)
      await storageSet({ [STORAGE_KEYS.REMINDERS]: reminders })
    } catch (error) {
      console.error("Failed to save reminder:", error)
      throw error
    }
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<void> {
    try {
      const reminders = await this.getReminders()
      const index = reminders.findIndex((r) => r.id === id)
      if (index !== -1) {
        reminders[index] = { ...reminders[index], ...updates }
        await storageSet({ [STORAGE_KEYS.REMINDERS]: reminders })
      }
    } catch (error) {
      console.error("Failed to update reminder:", error)
      throw error
    }
  }

  async deleteReminder(id: string): Promise<void> {
    try {
      const reminders = await this.getReminders()
      const filtered = reminders.filter((r) => r.id !== id)
      await storageSet({ [STORAGE_KEYS.REMINDERS]: filtered })
    } catch (error) {
      console.error("Failed to delete reminder:", error)
      throw error
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const result = await storageGet(STORAGE_KEYS.PRODUCTS)
      const products =
        (result[STORAGE_KEYS.PRODUCTS] as Record<string, Product>) || {}
      return products[id] || null
    } catch (error) {
      console.error("Failed to get product:", error)
      return null
    }
  }

  async saveProduct(product: Product): Promise<void> {
    try {
      const result = await storageGet(STORAGE_KEYS.PRODUCTS)
      const products =
        (result[STORAGE_KEYS.PRODUCTS] as Record<string, Product>) || {}
      products[product.id] = product
      await storageSet({ [STORAGE_KEYS.PRODUCTS]: products })
    } catch (error) {
      console.error("Failed to save product:", error)
      throw error
    }
  }

  async updateProductState(id: string, state: Product["state"]): Promise<void> {
    try {
      const result = await storageGet(STORAGE_KEYS.PRODUCTS)
      const products =
        (result[STORAGE_KEYS.PRODUCTS] as Record<string, Product>) || {}
      if (products[id]) {
        products[id].state = state
        await storageSet({ [STORAGE_KEYS.PRODUCTS]: products })
      } else {
        console.warn("Product not found for state update:", id)
      }
    } catch (error) {
      console.error("Failed to update product state:", error)
      throw error
    }
  }

  async getSettings(): Promise<Settings> {
    try {
      const result = await storageGet(STORAGE_KEYS.SETTINGS)
      return (result[STORAGE_KEYS.SETTINGS] as Settings) || DEFAULT_SETTINGS
    } catch (error) {
      console.error("Failed to get settings:", error)
      return DEFAULT_SETTINGS
    }
  }

  async updateSettings(settings: Partial<Settings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings()
      const updatedSettings = { ...currentSettings, ...settings }
      await storageSet({ [STORAGE_KEYS.SETTINGS]: updatedSettings })
    } catch (error) {
      console.error("Failed to update settings:", error)
      throw error
    }
  }

  async getCurrentTabSessionState(
    tabId: number | null
  ): Promise<TabSessionState | null> {
    try {
      if (tabId === null) return null
      const result = await storageGet(STORAGE_KEYS.TAB_SESSION_STATE)
      const states =
        (result[STORAGE_KEYS.TAB_SESSION_STATE] as Record<
          number,
          TabSessionState
        >) || {}
      return states[tabId] || null
    } catch (error) {
      console.error("Failed to get current tab session state:", error)
      return null
    }
  }

  async saveTabSessionState(state: TabSessionState): Promise<void> {
    try {
      if (state.tabId === null) return
      const result = await storageGet(STORAGE_KEYS.TAB_SESSION_STATE)
      const states =
        (result[STORAGE_KEYS.TAB_SESSION_STATE] as Record<
          number,
          TabSessionState
        >) || {}
      states[state.tabId] = state
      await storageSet({ [STORAGE_KEYS.TAB_SESSION_STATE]: states })
    } catch (error) {
      console.error("Failed to save tab session state:", error)
      throw error
    }
  }

  async getGlobalSnooze(): Promise<number | null> {
    try {
      const result = await storageGet(STORAGE_KEYS.SNOOZE)
      const snoozedUntil = result[STORAGE_KEYS.SNOOZE] as number | undefined
      return snoozedUntil || null
    } catch (error) {
      console.error("Failed to get global snooze:", error)
      return null
    }
  }

  async setGlobalSnooze(timestamp: number): Promise<void> {
    try {
      await storageSet({ [STORAGE_KEYS.SNOOZE]: timestamp })
      console.log(
        "[BrowserStorage] Global snooze set until:",
        new Date(timestamp)
      )
    } catch (error) {
      console.error("Failed to set global snooze:", error)
      throw error
    }
  }

  async clearGlobalSnooze(): Promise<void> {
    try {
      const hasDirect = hasDirectStorageAccess()
      if (hasDirect) {
        return new Promise((resolve) => {
          chrome.storage.local.remove(STORAGE_KEYS.SNOOZE, resolve)
        })
      } else {
        await sendStorageMessage(MessageType.STORAGE_REMOVE, {
          keys: [STORAGE_KEYS.SNOOZE]
        })
      }
      console.log("[BrowserStorage] Global snooze cleared")
    } catch (error) {
      console.error("Failed to clear global snooze:", error)
      throw error
    }
  }
}
