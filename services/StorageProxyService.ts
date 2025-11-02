/**
 * Chrome Storage Proxy Service
 *
 * Proxies storage operations for content scripts that don't have direct access.
 * Handles storage requests from content scripts via message passing.
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
