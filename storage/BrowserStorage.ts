import type { IStorage } from './IStorage'
import type { Reminder, Product, Settings, StorageData } from './types'
import { DEFAULT_SETTINGS } from './types'

const STORAGE_KEYS = {
  REMINDERS: 'thinktwice_reminders',
  PRODUCTS: 'thinktwice_products',
  SETTINGS: 'thinktwice_settings'
}

// Helper to determine if we're in a context with direct chrome.storage access
const hasDirectStorageAccess = (): boolean => {
  try {
    return typeof chrome !== 'undefined' && 
           typeof chrome.storage !== 'undefined' && 
           typeof chrome.storage.local !== 'undefined'
  } catch {
    return false
  }
}

// Helper to use message passing when direct access is not available
const sendStorageMessage = <T>(type: string, payload: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('[BrowserStorage] Sending message:', type, payload)
      chrome.runtime.sendMessage({ type, ...payload }, (response) => {
        console.log('[BrowserStorage] Received response:', response, 'lastError:', chrome.runtime.lastError)
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else if (response?.success) {
          resolve(response.data)
        } else {
          reject(new Error('Storage operation failed - no success response'))
        }
      })
    } catch (error) {
      console.error('[BrowserStorage] Exception in sendStorageMessage:', error)
      reject(error)
    }
  })
}

// Wrapper for chrome.storage operations that works in all contexts
const storageGet = async (keys: string | string[]): Promise<any> => {
  const hasDirect = hasDirectStorageAccess()
  console.log('[BrowserStorage] storageGet - hasDirectStorageAccess:', hasDirect)
  
  if (hasDirect) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve)
    })
  } else {
    return sendStorageMessage('STORAGE_GET', { keys })
  }
}

const storageSet = async (data: any): Promise<void> => {
  const hasDirect = hasDirectStorageAccess()
  console.log('[BrowserStorage] storageSet - hasDirectStorageAccess:', hasDirect)
  
  if (hasDirect) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, resolve)
    })
  } else {
    await sendStorageMessage('STORAGE_SET', { data })
  }
}

export class BrowserStorage implements IStorage {
  async getReminders(): Promise<Reminder[]> {
    try {
      const result = await storageGet(STORAGE_KEYS.REMINDERS)
      return result[STORAGE_KEYS.REMINDERS] || []
    } catch (error) {
      console.error('Failed to get reminders:', error)
      return []
    }
  }

  async getReminderById(id: string): Promise<Reminder | null> {
    try {
      const reminders = await this.getReminders()
      return reminders.find(r => r.id === id) || null
    } catch (error) {
      console.error('Failed to get reminder by id:', error)
      return null
    }
  }

  async saveReminder(reminder: Reminder): Promise<void> {
    try {
      const reminders = await this.getReminders()
      reminders.push(reminder)
      await storageSet({ [STORAGE_KEYS.REMINDERS]: reminders })
    } catch (error) {
      console.error('Failed to save reminder:', error)
      throw error
    }
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<void> {
    try {
      const reminders = await this.getReminders()
      const index = reminders.findIndex(r => r.id === id)
      if (index !== -1) {
        reminders[index] = { ...reminders[index], ...updates }
        await storageSet({ [STORAGE_KEYS.REMINDERS]: reminders })
      }
    } catch (error) {
      console.error('Failed to update reminder:', error)
      throw error
    }
  }

  async deleteReminder(id: string): Promise<void> {
    try {
      const reminders = await this.getReminders()
      const filtered = reminders.filter(r => r.id !== id)
      await storageSet({ [STORAGE_KEYS.REMINDERS]: filtered })
    } catch (error) {
      console.error('Failed to delete reminder:', error)
      throw error
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const result = await storageGet(STORAGE_KEYS.PRODUCTS)
      const products = result[STORAGE_KEYS.PRODUCTS] || {}
      return products[id] || null
    } catch (error) {
      console.error('Failed to get product:', error)
      return null
    }
  }

  async saveProduct(product: Product): Promise<void> {
    try {
      const result = await storageGet(STORAGE_KEYS.PRODUCTS)
      const products = result[STORAGE_KEYS.PRODUCTS] || {}
      products[product.id] = product
      await storageSet({ [STORAGE_KEYS.PRODUCTS]: products })
    } catch (error) {
      console.error('Failed to save product:', error)
      throw error
    }
  }

  async getSettings(): Promise<Settings> {
    try {
      const result = await storageGet(STORAGE_KEYS.SETTINGS)
      return result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS
    } catch (error) {
      console.error('Failed to get settings:', error)
      return DEFAULT_SETTINGS
    }
  }

  async updateSettings(settings: Partial<Settings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings()
      const updatedSettings = { ...currentSettings, ...settings }
      await storageSet({ [STORAGE_KEYS.SETTINGS]: updatedSettings })
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }
}

