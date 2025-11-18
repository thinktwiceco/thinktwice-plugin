/**
 * Chrome Storage Proxy Service
 *
 * LOW-LEVEL storage service used ONLY by the background script.
 *
 * ROLE:
 * - Provides direct chrome.storage.local operations with error handling
 * - Used by background.ts to HANDLE incoming STORAGE_GET/SET/REMOVE messages
 * - Provides storage change listener registration for React hooks
 *
 * CONTEXT: Background script (has direct chrome.storage access)
 *
 * WHEN TO USE:
 * - In background.ts message listener to process storage requests
 * - In hooks/components that need to listen for storage changes
 *
 * WHEN NOT TO USE:
 * - DON'T use this for domain-specific operations (use BrowserStorage instead)
 * - DON'T use this in content scripts (it assumes direct storage access)
 *
 * ARCHITECTURE:
 * Content Script → sends STORAGE_GET message → Background Script
 *                                               ↓
 *                                         StorageProxyService.get()
 *                                               ↓
 *                                         chrome.storage.local
 *
 * See: BrowserStorage.ts for the high-level domain storage layer
 */

const chromeAPI = globalThis.chrome || chrome

export class StorageProxyService {
  /**
   * Get values from chrome.storage.local
   * @param keys - Single key or array of keys to retrieve
   * @returns Promise that resolves with the storage values or rejects on error
   */
  static get(keys: string | string[]): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      chromeAPI.storage.local.get(keys, (result) => {
        if (chromeAPI.runtime.lastError) {
          const error = new Error(chromeAPI.runtime.lastError.message)
          console.error("[StorageProxyService] STORAGE_GET error:", error)
          reject(error)
        } else {
          console.log("[StorageProxyService] STORAGE_GET result:", result)
          resolve(result)
        }
      })
    })
  }

  /**
   * Set values in chrome.storage.local
   * @param data - Object with key-value pairs to store
   * @returns Promise that resolves when storage is set or rejects on error
   */
  static set(data: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log("[StorageProxyService] STORAGE_SET data:", data)
      chromeAPI.storage.local.set(data, () => {
        if (chromeAPI.runtime.lastError) {
          const error = new Error(chromeAPI.runtime.lastError.message)
          console.error("[StorageProxyService] STORAGE_SET error:", error)
          reject(error)
        } else {
          console.log("[StorageProxyService] STORAGE_SET completed")
          resolve()
        }
      })
    })
  }

  /**
   * Remove values from chrome.storage.local
   * @param keys - Single key or array of keys to remove
   * @returns Promise that resolves when storage is removed or rejects on error
   */
  static remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      chromeAPI.storage.local.remove(keys, () => {
        if (chromeAPI.runtime.lastError) {
          const error = new Error(chromeAPI.runtime.lastError.message)
          console.error("[StorageProxyService] STORAGE_REMOVE error:", error)
          reject(error)
        } else {
          console.log("[StorageProxyService] STORAGE_REMOVE completed")
          resolve()
        }
      })
    })
  }

  /**
   * Add a listener for chrome.storage.onChanged events
   * @param callback - Function to call when storage changes
   * @returns Cleanup function to remove the listener
   */
  static addChangeListener(
    callback: (changes: chrome.storage.StorageChange, areaName: string) => void
  ): () => void {
    if (
      typeof chromeAPI !== "undefined" &&
      typeof chromeAPI.storage !== "undefined" &&
      typeof chromeAPI.storage.onChanged !== "undefined"
    ) {
      chromeAPI.storage.onChanged.addListener(callback)
      return () => {
        chromeAPI.storage.onChanged.removeListener(callback)
      }
    }
    // Return no-op cleanup function if storage API is not available
    return () => {}
  }
}
