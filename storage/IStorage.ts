import type { Product, Reminder, Settings } from "./types"

export interface IStorage {
  getReminders(): Promise<Reminder[]>
  getReminderById(id: string): Promise<Reminder | null>
  saveReminder(reminder: Reminder): Promise<void>
  updateReminder(id: string, updates: Partial<Reminder>): Promise<void>
  deleteReminder(id: string): Promise<void>

  getProduct(id: string): Promise<Product | null>
  saveProduct(product: Product): Promise<void>
  updateProductState(id: string, state: Product["state"]): Promise<void>

  getSettings(): Promise<Settings>
  updateSettings(settings: Partial<Settings>): Promise<void>
}
