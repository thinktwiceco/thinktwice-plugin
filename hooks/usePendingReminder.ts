import { useEffect, useState } from "react"

import type { Product } from "~/storage"
import { storage } from "~/storage"
import { extractProduct } from "~/utils/productExtractor"

interface UsePendingReminderParams {
  getProductId: (url: string) => string | null
  marketplace: string
}

interface UsePendingReminderReturn {
  currentView: "product" | "earlyreturn" | "oldflame" | null
  currentProduct: Product | null
  reminderId: string | null
  hideOverlay: boolean
}

/**
 * Checks if the current product page has a pending reminder and determines
 * which view to show based on reminder status and timing.
 */
export function usePendingReminder({
  getProductId,
  marketplace
}: UsePendingReminderParams): UsePendingReminderReturn {
  const [currentView, setCurrentView] = useState<
    "product" | "earlyreturn" | "oldflame" | null
  >(null)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [reminderId, setReminderId] = useState<string | null>(null)
  const [hideOverlay, setHideOverlay] = useState(true)

  useEffect(() => {
    const checkForPendingReminder = async () => {
      const url = window.location.href
      const productId = getProductId(url)

      if (productId) {
        try {
          // Create composite key for storage lookup
          const compositeKey = `${marketplace}-${productId}`

          // First check if this product has "iNeedThis" state - if so, don't show overlay
          const existingProduct = await storage.getProduct(compositeKey)
          if (existingProduct?.state !== "iNeedThis") {
            console.log(
              "[usePendingReminder] Product has not iNeedThis state - showing overlay"
            )
            setHideOverlay(false)
            return
          }

          const reminders = await storage.getReminders()
          const pendingReminder = reminders.find(
            (r) => r.productId === compositeKey && r.status === "pending"
          )

          if (pendingReminder) {
            console.log(
              "[usePendingReminder] Found pending reminder for this product:",
              pendingReminder.id
            )
            setReminderId(pendingReminder.id)

            // Extract product info
            const product = extractProduct(marketplace, productId)
            setCurrentProduct(product)

            const now = Date.now()

            // Differentiate between early return and old flame
            if (pendingReminder.reminderTime > now) {
              // User came back before reminder time - still sleeping on it
              console.log(
                "[usePendingReminder] User returned early - showing EarlyReturnFromSleep"
              )
              setCurrentView("earlyreturn")
            } else {
              // Reminder time has passed - they already achieved by resisting
              console.log(
                "[usePendingReminder] User returned after achievement - showing BackToAnOldFlame"
              )
              setCurrentView("oldflame")
            }
          }
        } catch (error) {
          console.error(
            "[usePendingReminder] Error checking for pending reminder:",
            error
          )
        }
      }
    }

    checkForPendingReminder()
  }, [getProductId, marketplace])

  return {
    currentView,
    currentProduct,
    reminderId,
    hideOverlay
  }
}
