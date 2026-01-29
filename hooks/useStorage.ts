import { useCallback, useEffect, useState } from "react"

import { storage, type Product, type Reminder, type Settings } from "../storage"

interface UseStorageReturn {
  reminders: Reminder[]
  products: { [productId: string]: Product }
  settings: Settings
  snoozeUntil: number | null
  loading: boolean
  error: Error | null
  saveReminder: (reminder: Reminder) => Promise<void>
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>
  deleteReminder: (id: string) => Promise<void>
  getProduct: (id: string) => Promise<Product | null>
  saveProduct: (product: Product) => Promise<void>
  refreshReminders: () => Promise<void>
  clearSnooze: () => Promise<void>
}

export function useStorage(): UseStorageReturn {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [products, setProducts] = useState<{ [productId: string]: Product }>({})
  const [settings, setSettings] = useState<Settings>({
    reminderDurations: [],
    defaultDuration: 0
  })
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [remindersData, settingsData, snoozeData] = await Promise.all([
        storage.getReminders(),
        storage.getSettings(),
        storage.getGlobalSnooze()
      ])

      setReminders(remindersData)
      setSettings(settingsData)
      setSnoozeUntil(snoozeData)

      const productsMap: { [productId: string]: Product } = {}
      for (const reminder of remindersData) {
        const product = await storage.getProduct(reminder.productId)
        if (product) {
          productsMap[product.id] = product
        }
      }
      setProducts(productsMap)

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load data"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveReminder = useCallback(
    async (reminder: Reminder) => {
      await storage.saveReminder(reminder)
      await loadData()
    },
    [loadData]
  )

  const updateReminder = useCallback(
    async (id: string, updates: Partial<Reminder>) => {
      await storage.updateReminder(id, updates)
      await loadData()
    },
    [loadData]
  )

  const deleteReminder = useCallback(
    async (id: string) => {
      await storage.deleteReminder(id)
      await loadData()
    },
    [loadData]
  )

  const getProduct = useCallback(async (id: string) => {
    return await storage.getProduct(id)
  }, [])

  const saveProduct = useCallback(
    async (product: Product) => {
      await storage.saveProduct(product)
      await loadData()
    },
    [loadData]
  )

  const refreshReminders = useCallback(async () => {
    await loadData()
  }, [loadData])

  const clearSnooze = useCallback(async () => {
    await storage.clearGlobalSnooze()
    await loadData()
  }, [loadData])

  return {
    reminders,
    products,
    settings,
    snoozeUntil,
    loading,
    error,
    saveReminder,
    updateReminder,
    deleteReminder,
    getProduct,
    saveProduct,
    refreshReminders,
    clearSnooze
  }
}
