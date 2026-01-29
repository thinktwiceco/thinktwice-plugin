import type { Product, Reminder, Settings, TabSessionState } from "./types"

export interface IStorage {
  getReminders(): Promise<Reminder[]>
  getReminderById(id: string): Promise<Reminder | null>
  saveReminder(reminder: Reminder): Promise<void>
  updateReminder(id: string, updates: Partial<Reminder>): Promise<void>
  deleteReminder(id: string): Promise<void>

  getCurrentTabSessionState(tabId: number): Promise<TabSessionState | null>
  saveTabSessionState(state: TabSessionState): Promise<void>
  getGlobalSnooze(): Promise<number | null>
  setGlobalSnooze(timestamp: number): Promise<void>
  clearGlobalSnooze(): Promise<void>
  getGlobalPluginClosed(): Promise<boolean>
  setGlobalPluginClosed(closed: boolean): Promise<void>

  getProduct(id: string): Promise<Product | null>
  saveProduct(product: Product): Promise<void>
  updateProductState(id: string, state: Product["state"]): Promise<void>

  getSettings(): Promise<Settings>
  updateSettings(settings: Partial<Settings>): Promise<void>
}
