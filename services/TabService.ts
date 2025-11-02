/**
 * Chrome Tabs Service
 *
 * Manages Chrome tab operations (create, close).
 * Handles tab manipulation from the background service worker.
 */

const chromeAPI = globalThis.chrome || chrome

export class TabService {
  /**
   * Close a tab by ID
   * @param tabId - ID of the tab to close
   * @returns Promise that resolves when tab is closed or rejects on error
   */
  static closeTab(tabId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      chromeAPI.tabs.remove(tabId, () => {
        if (chromeAPI.runtime.lastError) {
          const error = new Error(chromeAPI.runtime.lastError.message)
          console.error("[TabService] Failed to close tab:", error)
          reject(error)
        } else {
          console.log("[TabService] Tab closed successfully")
          resolve()
        }
      })
    })
  }

  /**
   * Create a new tab with the specified URL
   * @param url - URL to open in the new tab
   * @returns Promise that resolves when tab is created or rejects on error
   */
  static createTab(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chromeAPI.tabs.create({ url }, (tab) => {
        if (chromeAPI.runtime.lastError) {
          const error = new Error(chromeAPI.runtime.lastError.message)
          console.error("[TabService] Failed to create tab:", error)
          reject(error)
        } else {
          console.log("[TabService] Tab created successfully:", tab?.id)
          resolve()
        }
      })
    })
  }
}
