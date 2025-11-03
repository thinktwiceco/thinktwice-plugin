import { useEffect, useState } from "react"

import { StorageProxyService } from "~/services/StorageProxyService"
import type { Product } from "~/storage"
import { storage } from "~/storage"
import { ProductState } from "~/storage/types"
import { extractProduct } from "~/utils/productExtractor"

interface UseProductPageStateParams {
  getProductId: (url: string) => string | null
  marketplace: string
}

interface UseProductPageStateReturn {
  currentView: "product" | "earlyreturn" | "oldflame" | null
  currentProduct: Product | null
  reminderId: string | null
  hideOverlay: boolean
}

/**
 * Manages state for product pages including checking product state,
 * pending reminders, and determining which view to display.
 */
export function useProductPageState({
  getProductId,
  marketplace
}: UseProductPageStateParams): UseProductPageStateReturn {
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

          // First check if this product has "iNeedThis" state - if so, hide overlay
          const existingProduct = await storage.getProduct(compositeKey)
          if (existingProduct?.state === ProductState.I_NEED_THIS) {
            console.log(
              "[useProductPageState] Product has iNeedThis state - hiding overlay"
            )
            setHideOverlay(true)
            setCurrentView(null)
            return
          }

          // Product doesn't have iNeedThis state, show overlay
          console.log(
            "[useProductPageState] Product has not iNeedThis state - showing overlay"
          )
          setHideOverlay(false)

          const reminders = await storage.getReminders()
          const pendingReminder = reminders.find(
            (r) => r.productId === compositeKey && r.status === "pending"
          )

          if (pendingReminder) {
            console.log(
              "[useProductPageState] Found pending reminder for this product:",
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
                "[useProductPageState] User returned early - showing EarlyReturnFromSleep"
              )
              setCurrentView("earlyreturn")
            } else {
              // Reminder time has passed - they resisted the urge to buy
              console.log(
                "[useProductPageState] User returned after resisting - showing BackToAnOldFlame"
              )
              setCurrentView("oldflame")
            }
          } else {
            setCurrentView(null)
          }
        } catch (error) {
          console.error(
            "[useProductPageState] Error checking for pending reminder:",
            error
          )
        }
      }
    }

    checkForPendingReminder()

    // Set up storage change listener to re-check when products are updated
    const storageListener = (
      changes: chrome.storage.StorageChange,
      areaName: string
    ) => {
      // Only watch local storage changes
      if (areaName !== "local") return

      // Check if products storage changed - this might include our product
      if ("thinktwice_products" in changes) {
        console.log(
          "[useProductPageState] Products storage changed, re-checking..."
        )
        checkForPendingReminder()
      }
    }

    const removeListener =
      StorageProxyService.addChangeListener(storageListener)

    return removeListener
  }, [getProductId, marketplace])

  return {
    currentView,
    currentProduct,
    reminderId,
    hideOverlay
  }
}

// Export the old name for backwards compatibility (deprecated)
export const usePendingReminder = useProductPageState
