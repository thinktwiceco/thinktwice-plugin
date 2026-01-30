import { useEffect, useState } from "react"

import { ChromeMessaging } from "~/services/ChromeMessaging"
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
  product: Product | null
  reminderId: string | null
  reminderDuration: number | null
  reminderStartTime: number | null
  pluginClosed: boolean
  setPluginClosed: (closed: boolean) => void
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
  const [product, setProduct] = useState<Product | null>(null)
  const [reminderId, setReminderId] = useState<string | null>(null)
  const [reminderDuration, setReminderDuration] = useState<number | null>(null)
  const [reminderStartTime, setReminderStartTime] = useState<number | null>(
    null
  )
  const [pluginClosed, setPluginClosedState] = useState(true)
  const [tabIdSession, setTabIdSession] = useState<number | null>(null)
  const [urlChangeCounter, setUrlChangeCounter] = useState(0)

  useEffect(() => {
    ChromeMessaging.getTabId().then((tabId) => {
      setTabIdSession(tabId)
    })
  }, [])

  useEffect(() => {
    const handleUrlChange = () => {
      console.log("[useProductPageState] URL changed, triggering refresh")
      setUrlChangeCounter((prev) => prev + 1)
    }

    // Set initial
    handleUrlChange()

    // Listen for URL changes
    window.addEventListener("popstate", handleUrlChange)
    window.addEventListener("load", handleUrlChange)

    return () => {
      window.removeEventListener("popstate", handleUrlChange)
      window.removeEventListener("load", handleUrlChange)
    }
  }, [])

  useEffect(() => {
    const checkForPendingReminder = async () => {
      const productId = getProductId(window.location.href)
      console.log("[useProductPageState] Using productId:", productId)

      if (productId) {
        try {
          // Check 1: Global snooze
          console.log("[useProductPageState] Checking for global snooze...")
          const snoozedUntil = await storage.getGlobalSnooze()
          if (snoozedUntil && snoozedUntil > Date.now()) {
            console.log(
              "[useProductPageState] Global snooze active until:",
              new Date(snoozedUntil)
            )
            setPluginClosedState(true)
            setCurrentView(null)
            setProduct(null)
            return
          } else if (snoozedUntil) {
            // Snooze has expired - clear it
            console.log("[useProductPageState] Snooze expired, clearing...")
            await storage.clearGlobalSnooze()
          }

          // Check 2: Product has terminal state (I_NEED_THIS only)
          const compositeKey = `${marketplace}-${productId}`
          console.log(
            "[useProductPageState] Checking product storage for key:",
            compositeKey
          )
          const existingProduct = await storage.getProduct(compositeKey)
          console.log(
            "[useProductPageState] Existing product state:",
            existingProduct?.state
          )
          if (existingProduct?.state === ProductState.I_NEED_THIS) {
            console.log(
              "[useProductPageState] Product has I_NEED_THIS state - hiding overlay"
            )
            setPluginClosedState(true)
            setCurrentView(null)
            setProduct(null)
            return
          }

          // Check 3: User global close
          const globalClosed = await storage.getGlobalPluginClosed()
          if (globalClosed) {
            console.log(
              "[useProductPageState] Global plugin closed - hiding overlay"
            )
            setPluginClosedState(true)
            setCurrentView(null)
            setProduct(null)
            return
          }

          // All checks passed - show overlay
          console.log(
            "[useProductPageState] All checks passed - showing overlay"
          )
          setPluginClosedState(false)

          // Extract and merge product (fresh DOM data + stored state)
          try {
            const freshProduct = extractProduct(marketplace, productId)
            const mergedProduct = existingProduct
              ? { ...freshProduct, state: existingProduct.state }
              : freshProduct
            setProduct(mergedProduct)
            console.log(
              "[useProductPageState] Product extracted and merged:",
              mergedProduct.id
            )
          } catch (error) {
            console.error(
              "[useProductPageState] Failed to extract product:",
              error
            )
            setProduct(null)
          }

          // Check for pending reminders (early return / old flame views)
          const reminders = await storage.getReminders()
          const pendingReminder = reminders.find(
            (r) => r.productId === compositeKey && r.status === "pending"
          )

          if (pendingReminder) {
            console.log(
              "[useProductPageState] Found pending reminder for this product:",
              pendingReminder.id
            )

            // Check if just created in this session
            const currentTabSessionState =
              await storage.getCurrentTabSessionState(tabIdSession)
            if (
              currentTabSessionState?.justCreatedReminderId ===
              pendingReminder.id
            ) {
              console.log(
                "[useProductPageState] Reminder was just created in this session, skipping early return view"
              )
              await storage.saveTabSessionState({
                ...currentTabSessionState,
                justCreatedReminderId: null
              })
              setReminderId(null)
              setReminderDuration(null)
              setReminderStartTime(null)
              setCurrentView(null)
              // Keep product - it was already extracted above
              return
            }

            setReminderId(pendingReminder.id)
            setReminderDuration(pendingReminder.duration)
            setReminderStartTime(
              pendingReminder.reminderTime - pendingReminder.duration
            )

            const now = Date.now()
            if (pendingReminder.reminderTime > now) {
              console.log(
                "[useProductPageState] User returned early - showing EarlyReturnFromSleep"
              )
              setCurrentView("earlyreturn")
            } else {
              console.log(
                "[useProductPageState] User returned after resisting - showing BackToAnOldFlame"
              )
              setCurrentView("oldflame")
            }
          } else {
            setReminderId(null)
            setReminderDuration(null)
            setReminderStartTime(null)
            setCurrentView(null)
          }
        } catch (error) {
          console.error("[useProductPageState] Error:", error)
        }
      }
    }

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

      // Check if snooze storage changed - need to re-check visibility
      if ("thinktwice_snooze" in changes) {
        console.log(
          "[useProductPageState] Snooze storage changed, re-checking..."
        )
        checkForPendingReminder()
      }

      // Check if global plugin closed changed
      if ("thinktwice_global_plugin_closed" in changes) {
        console.log(
          "[useProductPageState] Global plugin closed changed, re-checking..."
        )
        checkForPendingReminder()
      }
    }

    checkForPendingReminder()

    // Set up storage change listener to re-check when products are updated

    const removeListener =
      StorageProxyService.addChangeListener(storageListener)

    return removeListener
  }, [getProductId, marketplace, tabIdSession, urlChangeCounter])

  const setPluginClosed = async (closed: boolean) => {
    console.log("[useProductPageState] Setting global plugin closed:", closed)
    setPluginClosedState(closed)
    await storage.setGlobalPluginClosed(closed)
  }

  return {
    currentView,
    product,
    reminderId,
    reminderDuration,
    reminderStartTime,
    pluginClosed,
    setPluginClosed
  }
}
