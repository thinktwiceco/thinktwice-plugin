export enum ProductState {
  SLEEPING_ON_IT = "sleepingOnIt",
  I_NEED_THIS = "iNeedThis",
  DONT_NEED_IT = "dontNeedIt"
}

export interface Product {
  id: string
  name: string
  price: string | null
  image: string | null
  url: string
  timestamp: number
  marketplace: string
  state?: ProductState | null
}

export interface Reminder {
  id: string
  productId: string
  reminderTime: number
  duration: number
  status: "pending" | "completed" | "dismissed"
}

export interface Settings {
  reminderDurations: number[]
  defaultDuration: number
}

export interface StorageData {
  reminders: Reminder[]
  products: { [productId: string]: Product }
  settings: Settings
}

export interface TabSessionState {
  tabId: number | null
  justCreatedReminderId?: string | null
}

export const DEFAULT_SETTINGS: Settings = {
  reminderDurations: [
    1 * 60 * 1000, // 1 minute (debug)
    1 * 60 * 60 * 1000, // 1 hour
    6 * 60 * 60 * 1000, // 6 hours
    24 * 60 * 60 * 1000, // 24 hours
    3 * 24 * 60 * 60 * 1000, // 3 days
    7 * 24 * 60 * 60 * 1000 // 1 week
  ],
  defaultDuration: 24 * 60 * 60 * 1000 // 24 hours
}
