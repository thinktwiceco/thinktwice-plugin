/**
 * Chrome Runtime Messaging Service
 *
 * Unified interface for Chrome runtime message passing.
 * Provides type-safe methods for communicating with the background service worker.
 */

import type { Message, MessageResponse } from "../types/messages"
import { MessageType as MT } from "../types/messages"

const chromeAPI = globalThis.chrome || chrome

export class ChromeMessaging {
  /**
   * Create a Chrome alarm for a reminder
   * @param reminderId - Unique identifier for the reminder
   * @param when - Timestamp when the alarm should fire
   */
  static async createAlarm(reminderId: string, when: number): Promise<void> {
    await this.sendMessage({
      type: MT.CREATE_ALARM,
      reminderId,
      when
    })
  }

  /**
   * Close the current browser tab
   */
  static async closeCurrentTab(): Promise<void> {
    await this.sendMessage({
      type: MT.CLOSE_CURRENT_TAB
    })
  }

  /**
   * Create a new browser tab with the specified URL
   * @param url - URL to open in the new tab
   */
  static async createTab(url: string): Promise<void> {
    await this.sendMessage({
      type: MT.CREATE_TAB,
      url
    })
  }

  /**
   * Get the current tab ID
   * @returns Promise that resolves with the tab ID
   */
  static async getTabId(): Promise<number> {
    return await this.sendMessage<number>({
      type: MT.GET_TAB_ID
    })
  }

  /**
   * Generic message sender with type safety and error handling
   * @private
   */
  private static sendMessage<T = void>(message: Message): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        chromeAPI.runtime.sendMessage(
          message,
          (response: MessageResponse<T>) => {
            if (chromeAPI.runtime.lastError) {
              reject(new Error(chromeAPI.runtime.lastError.message))
            } else if (response?.success) {
              resolve(response.data as T)
            } else {
              reject(new Error(response?.error || "Message operation failed"))
            }
          }
        )
      } catch (error) {
        reject(error)
      }
    })
  }
}
