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
  currentProduct: Product | null
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
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [reminderId, setReminderId] = useState<string | null>(null)
  const [reminderDuration, setReminderDuration] = useState<number | null>(null)
  const [reminderStartTime, setReminderStartTime] = useState<number | null>(
    null
  )
  const [pluginClosed, setPluginClosedState] = useState(true)
  const [tabIdSession, setTabIdSession] = useState<number | null>(null)
  const [currentProductId, setCurrentProductId] = useState<string | null>(null)

  useEffect(() => {
    ChromeMessaging.getTabId().then((tabId) => {
      setTabIdSession(tabId)
    })
  }, [])

  useEffect(() => {
    const updateProductId = () => {
      const url = window.location.href
      const productId = getProductId(url)
      setCurrentProductId((prev) => {
        if (prev !== productId) {
          console.log(
            "[useProductPageState] ProductId changed:",
            prev,
            "->",
            productId
          )
          return productId
        }
        return prev
      })
    }

    // Set initial productId
    updateProductId()

    // Listen for popstate (browser back/forward)
    window.addEventListener("popstate", updateProductId)

    // Listen for full page navigations (when page is fully loaded)
    window.addEventListener("load", updateProductId)

    return () => {
      window.removeEventListener("popstate", updateProductId)
      window.removeEventListener("load", updateProductId)
    }
  }, [getProductId])

  useEffect(() => {
    const checkForPendingReminder = async () => {
      const productId = currentProductId || getProductId(window.location.href)
      console.log(
        "[useProductPageState] Using productId:",
        productId,
        "(from state:",
        currentProductId,
        ")"
      )

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
            return
          } else if (snoozedUntil) {
            // Snooze has expired - clear it
            console.log("[useProductPageState] Snooze expired, clearing...")
            await storage.clearGlobalSnooze()
          }

          // Check 2: Product has terminal state (I_NEED_THIS)
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
            return
          }

          // All checks passed - show overlay
          console.log(
            "[useProductPageState] All checks passed - showing overlay"
          )
          setPluginClosedState(false)

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
              return
            }

            setReminderDuration(pendingReminder.duration)
            setReminderStartTime(
              pendingReminder.reminderTime - pendingReminder.duration
            )
            const product = extractProduct(marketplace, productId)
            setCurrentProduct(product)

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
  }, [getProductId, marketplace, tabIdSession, currentProductId])

  const setPluginClosed = async (closed: boolean) => {
    console.log("[useProductPageState] Setting global plugin closed:", closed)
    setPluginClosedState(closed)
    await storage.setGlobalPluginClosed(closed)
  }

  return {
    currentView,
    currentProduct,
    reminderId,
    reminderDuration,
    reminderStartTime,
    pluginClosed,
    setPluginClosed
  }
}
